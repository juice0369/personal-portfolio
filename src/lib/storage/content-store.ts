import { CONTENT_STATE_VERSION, CONTENT_STORAGE_KEY } from '../constants'
import { contentStateSchema, type ContentState } from '../schema'
import { issuesToMessages } from '../validation'

/**
 * 内容数据的 localStorage 读写。
 * 单一键、整体读写；读取时先解析 JSON 再校验 schema，任何一步失败都视为"无本地数据"。
 */

export type LoadContentResult =
  | { ok: true; state: ContentState; migrated: boolean }
  | { ok: false; reason: 'unavailable' | 'empty' | 'unparsable' | 'invalid'; messages: string[] }

export type SaveContentResult = { ok: true } | { ok: false; message: string }

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    // 隐私模式等场景下访问 localStorage 会抛异常
    return null
  }
}

/**
 * 版本迁移：当前只有 v1，因此仅补齐缺失的版本号。
 * 未来新增结构版本时，在此按 version 从小到大逐级升级，并为新字段补默认值。
 */
export function migrateContent(raw: unknown): { value: unknown; migrated: boolean } {
  if (typeof raw !== 'object' || raw === null) {
    return { value: raw, migrated: false }
  }

  const record: Record<string, unknown> = { ...(raw as Record<string, unknown>) }
  let migrated = false

  if (record.version === undefined) {
    record.version = CONTENT_STATE_VERSION
    migrated = true
  }

  return { value: record, migrated }
}

export function loadContent(): LoadContentResult {
  const storage = getStorage()
  if (!storage) {
    return { ok: false, reason: 'unavailable', messages: ['当前浏览器不可用本地存储'] }
  }

  const text = storage.getItem(CONTENT_STORAGE_KEY)
  if (text === null) {
    return { ok: false, reason: 'empty', messages: [] }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'unparsable', messages: ['本地数据不是合法的 JSON'] }
  }

  const { value, migrated } = migrateContent(parsed)
  const result = contentStateSchema.safeParse(value)
  if (!result.success) {
    return {
      ok: false,
      reason: 'invalid',
      messages: issuesToMessages(result.error.issues, 5),
    }
  }

  return { ok: true, state: result.data, migrated }
}

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const candidate = error as Error & { name?: string; code?: number }
  return (
    candidate.name === 'QuotaExceededError' ||
    candidate.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    candidate.code === 22 ||
    candidate.code === 1014
  )
}

export function saveContent(state: ContentState): SaveContentResult {
  const storage = getStorage()
  if (!storage) {
    return { ok: false, message: '当前浏览器不可用本地存储，本次修改未能保存' }
  }

  try {
    storage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(state))
    return { ok: true }
  } catch (error) {
    if (isQuotaError(error)) {
      return {
        ok: false,
        message: '本地存储空间不足，请先在"站点设置"中导出数据备份，再清理不需要的内容',
      }
    }
    return { ok: false, message: '保存到本地存储失败，请检查浏览器设置后重试' }
  }
}

export function clearContent(): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(CONTENT_STORAGE_KEY)
  } catch {
    // 忽略清理失败：此时用户仍可通过导出数据自行备份
  }
}
