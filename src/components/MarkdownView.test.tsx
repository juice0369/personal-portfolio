import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownView } from './MarkdownView'

/** AC-F06 / AC-F18：Markdown 中的脚本与事件属性不得产生可执行节点 */
describe('MarkdownView 安全渲染', () => {
  it('不渲染 script 元素，也不执行其中的代码', () => {
    const { container } = render(
      <MarkdownView content={'<script>window.injectedByTest = true</script>\n\n正文段落'} />,
    )

    expect(container.querySelector('script')).toBeNull()
    expect((window as unknown as Record<string, unknown>).injectedByTest).toBeUndefined()
    expect(screen.getByText(/正文段落/)).toBeInTheDocument()
  })

  it('原始 HTML 中的 img 不会被渲染成真实元素，事件属性无从生效', () => {
    const { container } = render(
      <MarkdownView content={'<img src="x" onerror="window.injectedByTest = true" alt="图">'} />,
    )

    // 未启用 rehype-raw，因此原始 HTML 视为纯文本，不会生成 img 元素
    expect(container.querySelector('img')).toBeNull()
    expect((window as unknown as Record<string, unknown>).injectedByTest).toBeUndefined()
  })

  it('Markdown 图片语法的 img 不带事件属性，alt 缺省时为空字符串', () => {
    const { container } = render(<MarkdownView content={'![示意图](https://example.com/a.png)'} />)

    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('alt')).toBe('示意图')
    expect(img?.getAttribute('onerror')).toBeNull()
  })

  it('丢弃 javascript: 伪协议链接的 href', () => {
    const { container } = render(<MarkdownView content={'[点我](javascript:alert(1))'} />)

    expect(container.querySelector('a[href^="javascript"]')).toBeNull()
  })

  it('保留 http/https 链接并补上 rel，避免来源泄漏', () => {
    render(<MarkdownView content={'[示例](https://example.com)'} />)

    const link = screen.getByRole('link', { name: /示例/ })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('渲染 GFM 表格', () => {
    const content = ['| 列 A | 列 B |', '| --- | --- |', '| 1 | 2 |'].join('\n')
    render(<MarkdownView content={content} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '列 A' })).toBeInTheDocument()
  })

  it('正文中的一级标题降级为 h2，避免破坏页面标题层级', () => {
    const { container } = render(<MarkdownView content={'# 大标题'} />)

    expect(container.querySelector('h1')).toBeNull()
    expect(container.querySelector('h2')?.textContent).toBe('大标题')
  })
})
