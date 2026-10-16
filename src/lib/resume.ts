/**
 * 简历下载的来源解析（AC-F09）。
 *
 * 优先级：管理员上传的文件 → 内置简历（`public/resume-sample.pdf`，站点所有者本人的简历）→
 * 都不可用（按钮置为不可用并提示）。抽成纯函数便于单测覆盖三种分支，包括"两者都不存在"这一条。
 */

export type ResumeSource = {
  href: string
  fileName: string
  fromUpload: boolean
}

export const BUILT_IN_RESUME_FILE_NAME = 'resume-sample.pdf'

export function resolveResumeSource(input: {
  assetId: 'resume' | null
  objectUrl: string | null
  fileName: string | null
  fallbackUrl: string
}): ResumeSource | null {
  if (input.assetId === 'resume' && input.objectUrl !== null && input.fileName !== null) {
    return { href: input.objectUrl, fileName: input.fileName, fromUpload: true }
  }

  if (input.fallbackUrl.length > 0) {
    return { href: input.fallbackUrl, fileName: BUILT_IN_RESUME_FILE_NAME, fromUpload: false }
  }

  return null
}
