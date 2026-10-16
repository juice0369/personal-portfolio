/**
 * 极简 frontmatter 解析：只支持本站 Markdown 文件需要的 YAML 子集。
 * 支持 `key: value`、`key: "带引号的值"`、`key: [a, b, c]` 三种形式。
 * 不引入 YAML 依赖（依赖引入门槛见 AGENTS.md §9）。
 */

export type FrontmatterValue = string | string[]
export type FrontmatterData = Record<string, FrontmatterValue>

export type ParsedFrontmatter = {
  data: FrontmatterData
  content: string
}

function stripQuotes(value: string): string {
  if (value.length >= 2) {
    const first = value[0]
    const last = value[value.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1)
    }
  }
  return value
}

function parseList(rawValue: string): string[] {
  return rawValue
    .slice(1, -1)
    .split(',')
    .map((item) => stripQuotes(item.trim()))
    .filter((item) => item.length > 0)
}

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const normalized = raw.replace(/\r\n/g, '\n')

  if (!normalized.startsWith('---\n')) {
    return { data: {}, content: normalized.trim() }
  }

  const closingIndex = normalized.indexOf('\n---', 3)
  if (closingIndex === -1) {
    return { data: {}, content: normalized.trim() }
  }

  const header = normalized.slice(4, closingIndex)
  const content = normalized.slice(closingIndex + 4).replace(/^\n+/, '')
  const data: FrontmatterData = {}

  for (const line of header.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf(':')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const rawValue = trimmed.slice(separatorIndex + 1).trim()
    if (key.length === 0) continue

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      data[key] = parseList(rawValue)
    } else {
      data[key] = stripQuotes(rawValue)
    }
  }

  return { data, content }
}
