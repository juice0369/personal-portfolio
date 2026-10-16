import { markdownToPlainText } from './renderer'

/**
 * 阅读时长估算：中文按 300 字/分钟，英文按 200 词/分钟，分别统计后相加，向上取整且最小 1 分钟。
 * 刻意不把结果存入数据模型，渲染时计算即可（避免导入后数值过期）。
 */
export function estimateReadingMinutes(markdown: string): number {
  const plain = markdownToPlainText(markdown)
  if (plain.length === 0) return 1

  const hanCount = (plain.match(/[\p{Script=Han}]/gu) ?? []).length
  const latinWordCount = (plain.match(/[A-Za-z]+/g) ?? []).length

  const minutes = hanCount / 300 + latinWordCount / 200
  return Math.max(1, Math.ceil(minutes))
}
