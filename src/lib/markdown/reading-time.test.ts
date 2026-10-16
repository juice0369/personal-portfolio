import { describe, expect, it } from 'vitest'
import { markdownToPlainText } from './renderer'
import { estimateReadingMinutes } from './reading-time'

describe('markdownToPlainText', () => {
  it('去掉代码块、行内代码与语法符号', () => {
    const text = markdownToPlainText('## 标题\n\n`code` 与 **粗体** 和 [链接](https://example.com)')
    expect(text).toBe('标题 与 粗体 和 链接')
  })

  it('保留代码块之外的内容', () => {
    expect(markdownToPlainText('前\n\n```ts\nconst a = 1\n```\n\n后')).toBe('前 后')
  })
})

describe('estimateReadingMinutes', () => {
  it('空正文至少返回 1 分钟', () => {
    expect(estimateReadingMinutes('')).toBe(1)
    expect(estimateReadingMinutes('   ')).toBe(1)
  })

  it('纯中文按 300 字/分钟估算', () => {
    const text = '中'.repeat(600)
    expect(estimateReadingMinutes(text)).toBe(2)
  })

  it('纯英文按 200 词/分钟估算', () => {
    const text = Array.from({ length: 400 }, () => 'word').join(' ')
    expect(estimateReadingMinutes(text)).toBe(2)
  })

  it('中英混排分别统计后相加', () => {
    const text = `${'中'.repeat(300)}\n\n${Array.from({ length: 200 }, () => 'word').join(' ')}`
    expect(estimateReadingMinutes(text)).toBe(2)
  })

  it('极短正文向上取整为 1 分钟', () => {
    expect(estimateReadingMinutes('短句。')).toBe(1)
  })
})
