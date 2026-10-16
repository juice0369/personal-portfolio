/** 日期与时间的格式化与解析：全站统一出口，避免各处自行拼接导致格式不一致。 */

/** '2024-09' → '2024.09' */
export function formatYearMonth(value: string): string {
  return value.replace('-', '.')
}

/** '2024-09' + '2025-06' → '2024.09 — 2025.06'；end 为 null 表示"至今" */
export function formatYearMonthRange(start: string, end: string | null): string {
  return `${formatYearMonth(start)} — ${end === null ? '至今' : formatYearMonth(end)}`
}

/** '2026-10-16' → '2026 年 10 月 16 日' */
export function formatIsoDate(value: string): string {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`
}

/** ISO 时间戳（含时区），用于 updatedAt 等字段 */
export function nowTimestamp(date: Date = new Date()): string {
  return date.toISOString()
}

/** 本地日期（YYYY-MM-DD），用于文章发布日期的默认值 */
export function todayIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function currentYear(date: Date = new Date()): number {
  return date.getFullYear()
}

/** ISO 时间戳 → '2026-10-16 14:05'（本地时间），用于后台列表的"最后修改"列 */
export function formatTimestamp(value: string, fallback = '—'): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

type TimelineOrderable = { startDate: string; order: number }

/**
 * 时间线排序：开始时间倒序；开始时间相同时按 order 升序。
 * 'YYYY-MM' 为定长字符串，字典序与时间序一致，可直接比较。
 */
export function compareTimelineDesc(a: TimelineOrderable, b: TimelineOrderable): number {
  if (a.startDate !== b.startDate) return a.startDate < b.startDate ? 1 : -1
  return a.order - b.order
}

/** 按 order 升序排序（技能、分类、项目等） */
export function compareByOrder<T extends { order: number }>(a: T, b: T): number {
  return a.order - b.order
}

/** 按发布日期倒序排序 */
export function compareByPublishedAtDesc<T extends { publishedAt: string }>(a: T, b: T): number {
  if (a.publishedAt !== b.publishedAt) return a.publishedAt < b.publishedAt ? 1 : -1
  return 0
}
