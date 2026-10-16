import { contentStateSchema, type ContentState } from '../schema'
import { todayIsoDate } from '../date'
import { validateImportFile } from '../file-validation'
import { firstIssueMessage, issuesToMessages } from '../validation'
import { clearAssets } from './asset-db'
import { clearContent } from './content-store'

/**
 * 导出 / 导入 / 恢复默认。
 *
 * 导出内容为**纯内容数据**，不含头像与简历的二进制文件：
 * 换来的是零依赖（不需要 zip 库）与简单的实现，代价是换设备导入后需重新上传这两个文件。
 */

export type ExportPayload = ContentState & { exportedAt: string }

export type ReadImportResult =
  { ok: true; state: ContentState } | { ok: false; message: string; details: string[] }

export function buildExportPayload(state: ContentState, now: Date = new Date()): ExportPayload {
  return { ...state, exportedAt: now.toISOString() }
}

export function buildExportFileName(now: Date = new Date()): string {
  return `portfolio-backup-${todayIsoDate(now)}.json`
}

export function downloadJsonFile(payload: unknown, fileName: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

/**
 * 读取并校验导入文件。
 * 任何一步失败都不修改现有数据；成功时返回的是 schema 校验后的结果，
 * 未知字段（包括 __proto__ 之类）已在 schema 层被剥离，可直接写入状态。
 */
export async function readImportFile(file: File): Promise<ReadImportResult> {
  const check = validateImportFile(file)
  if (!check.ok) {
    return { ok: false, message: check.message, details: [] }
  }

  let text: string
  try {
    text = await file.text()
  } catch {
    return { ok: false, message: '读取文件失败，请重新选择文件', details: [] }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return {
      ok: false,
      message: '文件格式无法解析，请选择本站"数据导出"生成的 JSON 文件',
      details: [],
    }
  }

  const result = contentStateSchema.safeParse(parsed)
  if (!result.success) {
    return {
      ok: false,
      message: `文件内容不符合本站数据格式：${firstIssueMessage(result.error.issues, '字段校验未通过')}`,
      details: issuesToMessages(result.error.issues, 5),
    }
  }

  return { ok: true, state: result.data }
}

/** 清除全部本地数据（内容数据 + 已上传的文件） */
export async function clearAllLocalData(): Promise<void> {
  clearContent()
  await clearAssets()
}
