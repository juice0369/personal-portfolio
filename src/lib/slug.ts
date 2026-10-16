/**
 * slug 生成与去重。
 * 规则：去除标点 → 空白转连字符 → 英文转小写 → 合并连续连字符 → 去首尾连字符。
 * 中文保留原字（本站为纯前端路由，无需服务端解析，编码后可直接使用）。
 */

const MAX_SLUG_LENGTH = 80

export function generateSlug(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[’'"`]/g, '')
    .replace(/[^\p{Script=Han}a-z0-9\s-]/gu, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return base.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, '')
}

/** 若与已有标识冲突，追加 -2、-3 … */
export function uniqueSlug(candidate: string, taken: readonly string[]): string {
  const base = candidate.length > 0 ? candidate : 'item'
  if (!taken.includes(base)) return base

  let suffix = 2
  while (taken.includes(`${base}-${suffix}`)) {
    suffix += 1
  }
  return `${base}-${suffix}`
}

/** 详情页参数比对前先解码，保证中文 slug 可用 */
export function decodeSlug(param: string | undefined): string {
  if (!param) return ''
  try {
    return decodeURIComponent(param)
  } catch {
    return param
  }
}
