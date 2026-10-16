import { describe, expect, it } from 'vitest'
import {
  compareByOrder,
  compareByPublishedAtDesc,
  compareTimelineDesc,
  currentYear,
  formatIsoDate,
  formatTimestamp,
  formatYearMonth,
  formatYearMonthRange,
  nowTimestamp,
  todayIsoDate,
} from './date'

describe('年月格式化', () => {
  it('把 2024-09 展示为 2024.09', () => {
    expect(formatYearMonth('2024-09')).toBe('2024.09')
  })

  it('结束时间存在时用短横线连接两端', () => {
    expect(formatYearMonthRange('2024-09', '2025-06')).toBe('2024.09 — 2025.06')
  })

  it('结束时间为 null 时展示为"至今"', () => {
    expect(formatYearMonthRange('2024-09', null)).toBe('2024.09 — 至今')
  })
})

describe('日期格式化', () => {
  it('把 2026-10-16 展示为中文日期', () => {
    expect(formatIsoDate('2026-10-16')).toBe('2026 年 10 月 16 日')
  })

  it('日期格式不符合预期时原样返回，不抛异常', () => {
    expect(formatIsoDate('2026-10')).toBe('2026-10')
  })

  it('时间戳按本地时间展示为 YYYY-MM-DD HH:mm', () => {
    const date = new Date(2026, 9, 16, 14, 5)
    expect(formatTimestamp(date.toISOString())).toBe('2026-10-16 14:05')
  })

  it('非法时间戳返回兜底值', () => {
    expect(formatTimestamp('不是时间')).toBe('—')
    expect(formatTimestamp('不是时间', '未知')).toBe('未知')
  })
})

describe('写入用时间戳', () => {
  it('nowTimestamp 返回带时区的 ISO 8601', () => {
    expect(nowTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    )
  })

  it('todayIsoDate 使用本地日期而不是 UTC', () => {
    expect(todayIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    // 补零：个位数月份与日期都要两位
    expect(todayIsoDate(new Date(2026, 8, 9))).toBe('2026-09-09')
  })

  it('currentYear 取本地年份', () => {
    expect(currentYear(new Date(2026, 0, 1))).toBe(2026)
  })
})

describe('排序辅助', () => {
  it('时间线按开始时间倒序', () => {
    const items = [
      { startDate: '2023-09', order: 0 },
      { startDate: '2025-07', order: 0 },
    ]
    expect([...items].sort(compareTimelineDesc).map((item) => item.startDate)).toEqual([
      '2025-07',
      '2023-09',
    ])
  })

  it('开始时间相同时按 order 升序', () => {
    const items = [
      { startDate: '2025-07', order: 2 },
      { startDate: '2025-07', order: 1 },
    ]
    expect([...items].sort(compareTimelineDesc).map((item) => item.order)).toEqual([1, 2])
  })

  it('按 order 升序排序', () => {
    expect([{ order: 3 }, { order: 1 }].sort(compareByOrder).map((item) => item.order)).toEqual([
      1, 3,
    ])
  })

  it('按发布日期倒序排序', () => {
    const posts = [{ publishedAt: '2026-01-01' }, { publishedAt: '2026-05-01' }]
    expect([...posts].sort(compareByPublishedAtDesc).map((post) => post.publishedAt)).toEqual([
      '2026-05-01',
      '2026-01-01',
    ])
  })
})
