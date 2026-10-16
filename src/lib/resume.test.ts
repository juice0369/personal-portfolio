import { describe, expect, it } from 'vitest'
import { BUILT_IN_RESUME_FILE_NAME, resolveResumeSource } from './resume'

const FALLBACK = '/resume-sample.pdf'

describe('resolveResumeSource（AC-F09）', () => {
  it('已上传简历时优先使用上传文件，并保留原文件名', () => {
    const source = resolveResumeSource({
      assetId: 'resume',
      objectUrl: 'blob:http://localhost/abc',
      fileName: 'resume-2026.pdf',
      fallbackUrl: FALLBACK,
    })

    expect(source).toEqual({
      href: 'blob:http://localhost/abc',
      fileName: 'resume-2026.pdf',
      fromUpload: true,
    })
  })

  it('未上传简历时回落到内置简历', () => {
    const source = resolveResumeSource({
      assetId: null,
      objectUrl: null,
      fileName: null,
      fallbackUrl: FALLBACK,
    })

    expect(source).toEqual({
      href: FALLBACK,
      fileName: BUILT_IN_RESUME_FILE_NAME,
      fromUpload: false,
    })
  })

  it('标记为已上传但实际读不到文件时同样回落到内置简历', () => {
    const source = resolveResumeSource({
      assetId: 'resume',
      objectUrl: null,
      fileName: 'resume-2026.pdf',
      fallbackUrl: FALLBACK,
    })

    expect(source?.fromUpload).toBe(false)
    expect(source?.href).toBe(FALLBACK)
  })

  it('上传文件与内置简历都不可用时返回 null，由界面提示"简历暂不可用"', () => {
    expect(
      resolveResumeSource({
        assetId: null,
        objectUrl: null,
        fileName: null,
        fallbackUrl: '',
      }),
    ).toBeNull()
  })
})
