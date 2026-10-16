import { describe, expect, it } from 'vitest'
import { AVATAR_MAX_BYTES, IMPORT_MAX_BYTES, RESUME_MAX_BYTES } from './constants'
import {
  checkFile,
  formatBytes,
  getExtension,
  importRule,
  resumeRule,
  validateAvatarFile,
  validateImportFile,
  validateResumeFile,
} from './file-validation'
import { buildFile, buildFileWithSize } from '../test/helpers'

describe('formatBytes', () => {
  it('按量级选择单位', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB')
  })
})

describe('getExtension', () => {
  it('返回小写扩展名，不含扩展名时返回空字符串', () => {
    expect(getExtension('Resume.PDF')).toBe('.pdf')
    expect(getExtension('resume-2026.pdf')).toBe('.pdf')
    expect(getExtension('noextension')).toBe('')
    expect(getExtension('.hidden')).toBe('')
  })
})

describe('简历文件校验（F-19）', () => {
  it('接受扩展名与 MIME 一致、体积在限制内的 PDF', () => {
    const file = buildFileWithSize('resume-2026.pdf', 'application/pdf', 3 * 1024 * 1024)
    expect(validateResumeFile(file).ok).toBe(true)
  })

  it('拒绝超过 5MB 的文件并提示上限', () => {
    const file = buildFileWithSize('big.pdf', 'application/pdf', RESUME_MAX_BYTES + 1)
    const result = validateResumeFile(file)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('简历不能超过 5.00 MB')
      expect(result.message).toContain('当前文件为')
    }
  })

  it('拒绝空文件', () => {
    const file = buildFileWithSize('empty.pdf', 'application/pdf', 0)
    const result = validateResumeFile(file)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('文件内容为空')
  })

  it('拒绝 .docx 扩展名并列出允许的格式', () => {
    const file = buildFile(
      'x',
      'resume.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    const result = validateResumeFile(file)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('仅支持 .pdf 格式')
      expect(result.message).toContain('.docx')
    }
  })

  it('拒绝不在白名单内的 MIME 并列出允许的格式', () => {
    const file = buildFileWithSize('resume.pdf', 'image/png', 1024)
    const result = validateResumeFile(file)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('文件类型不受支持')
      expect(result.message).toContain('.pdf')
    }
  })

  it('MIME 缺失（部分系统不提供）时只按扩展名判断，仍然接受', () => {
    const file = buildFileWithSize('resume.pdf', '', 1024)
    expect(validateResumeFile(file).ok).toBe(true)
  })
})

describe('头像文件校验（F-15）', () => {
  it('接受 PNG、JPEG（.jpg / .jpeg）与 WebP', () => {
    expect(validateAvatarFile(buildFileWithSize('a.png', 'image/png', 1024)).ok).toBe(true)
    expect(validateAvatarFile(buildFileWithSize('a.jpg', 'image/jpeg', 1024)).ok).toBe(true)
    expect(validateAvatarFile(buildFileWithSize('a.jpeg', 'image/jpeg', 1024)).ok).toBe(true)
    expect(validateAvatarFile(buildFileWithSize('a.webp', 'image/webp', 1024)).ok).toBe(true)
  })

  it('拒绝 .txt 文件并说明只支持 PNG、JPEG、WebP', () => {
    const result = validateAvatarFile(buildFile('text', 'avatar.txt', 'text/plain'))

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('.png')
      expect(result.message).toContain('.webp')
    }
  })

  it('拒绝超过 2MB 的图片', () => {
    const result = validateAvatarFile(
      buildFileWithSize('big.png', 'image/png', AVATAR_MAX_BYTES + 1),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('头像不能超过 2.00 MB')
  })

  it('拒绝 MIME 与扩展名不一致的图片', () => {
    const result = validateAvatarFile(buildFileWithSize('a.png', 'image/jpeg', 1024))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('文件类型与扩展名不匹配')
  })
})

describe('导入文件校验（F-20）', () => {
  it('接受 MIME 为 application/json 的 .json 文件', () => {
    expect(validateImportFile(buildFile('{}', 'backup.json', 'application/json')).ok).toBe(true)
  })

  it('接受 MIME 为 text/plain 的 .json 文件（Windows 常见）', () => {
    expect(validateImportFile(buildFile('{}', 'backup.json', 'text/plain')).ok).toBe(true)
  })

  it('拒绝超过 2MB 的文件', () => {
    const result = validateImportFile(
      buildFileWithSize('big.json', 'application/json', IMPORT_MAX_BYTES + 1),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('数据文件不能超过 2.00 MB')
  })

  it('拒绝非 .json 扩展名', () => {
    const result = validateImportFile(buildFile('{}', 'backup.txt', 'text/plain'))
    expect(result.ok).toBe(false)
  })
})

describe('checkFile 校验顺序', () => {
  it('体积校验先于扩展名校验：超大且扩展名错误时提示体积', () => {
    const file = buildFileWithSize('huge.docx', 'application/msword', resumeRule.maxBytes + 1)
    const result = checkFile(file, resumeRule)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('不能超过')
  })

  it('空文件校验先于 MIME 校验', () => {
    const file = buildFileWithSize('empty.weird', 'application/x-unknown', 0)
    const result = checkFile(file, importRule)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('文件内容为空')
  })
})
