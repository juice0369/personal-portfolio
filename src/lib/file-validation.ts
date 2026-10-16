/**
 * 文件校验：体积 → 非空 → MIME → 扩展名 → MIME 与扩展名一致。
 * 目的是防止误操作与保证数据一致性；MIME 可被伪造，不构成安全防护。
 */

import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  IMPORT_MAX_BYTES,
  IMPORT_MIME_TYPES,
  RESUME_MAX_BYTES,
  RESUME_MIME_TYPES,
} from './constants'

export type FileRule = {
  /** 用于提示文案，例如"头像" */
  label: string
  maxBytes: number
  mimeTypes: readonly string[]
  /** 扩展名 → 允许的 MIME 列表，用于校验一致性 */
  expectedMimeByExtension: Record<string, readonly string[]>
}

export type FileCheckResult = { ok: true } | { ok: false; message: string }

/** 最小文件对象：只依赖校验需要的三个属性，便于测试与复用 */
export type FileLike = { name: string; size: number; type: string }

export const avatarRule: FileRule = {
  label: '头像',
  maxBytes: AVATAR_MAX_BYTES,
  mimeTypes: AVATAR_MIME_TYPES,
  expectedMimeByExtension: {
    '.png': ['image/png'],
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.webp': ['image/webp'],
  },
}

export const resumeRule: FileRule = {
  label: '简历',
  maxBytes: RESUME_MAX_BYTES,
  mimeTypes: RESUME_MIME_TYPES,
  expectedMimeByExtension: {
    '.pdf': ['application/pdf'],
  },
}

export const importRule: FileRule = {
  label: '数据文件',
  maxBytes: IMPORT_MAX_BYTES,
  mimeTypes: IMPORT_MIME_TYPES,
  // 部分系统不提供 .json 的 MIME，因此允许 text/plain 与空 MIME
  expectedMimeByExtension: {
    '.json': ['application/json', 'text/plain', ''],
  },
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf('.')
  if (index <= 0) return ''
  return fileName.slice(index).toLowerCase()
}

/** 规则支持的扩展名清单，用于错误提示 */
export function describeExtensions(rule: FileRule): string {
  return Object.keys(rule.expectedMimeByExtension).join('、')
}

export function checkFile(file: FileLike, rule: FileRule): FileCheckResult {
  if (file.size > rule.maxBytes) {
    return {
      ok: false,
      message: `${rule.label}不能超过 ${formatBytes(rule.maxBytes)}，当前文件为 ${formatBytes(file.size)}`,
    }
  }

  if (file.size === 0) {
    return { ok: false, message: `${rule.label}文件内容为空，请重新选择` }
  }

  const extension = getExtension(file.name)
  const expectedMimes = rule.expectedMimeByExtension[extension]
  if (!expectedMimes) {
    return {
      ok: false,
      message: `${rule.label}仅支持 ${describeExtensions(rule)} 格式，当前为 ${extension || '未知格式'}`,
    }
  }

  const mime = file.type.toLowerCase()
  if (mime.length > 0 && !rule.mimeTypes.includes(mime)) {
    return {
      ok: false,
      message: `${rule.label}的文件类型不受支持（${mime}），请选择 ${describeExtensions(rule)} 文件`,
    }
  }

  if (mime.length > 0 && !expectedMimes.includes(mime)) {
    return {
      ok: false,
      message: `${rule.label}的文件类型与扩展名不匹配（${file.name}），请重新选择`,
    }
  }

  return { ok: true }
}

export const validateAvatarFile = (file: FileLike) => checkFile(file, avatarRule)
export const validateResumeFile = (file: FileLike) => checkFile(file, resumeRule)
export const validateImportFile = (file: FileLike) => checkFile(file, importRule)
