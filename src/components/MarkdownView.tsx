import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

/**
 * 统一的 Markdown 渲染入口。
 *
 * 安全策略（AGENTS.md §6.3）：
 * - 交给 react-markdown 生成 React 元素树，绝不使用 dangerouslySetInnerHTML；
 * - 插件只有 remark-gfm（表格 / 任务列表）与 rehype-sanitize（白名单过滤），
 *   刻意不引入 rehype-raw，因此正文中的 HTML 与脚本只会以纯文本呈现；
 * - 链接协议限定为 http / https / mailto，阻断 javascript: 等伪协议（AC-F06）。
 *
 * 排版样式在 index.css 的 .markdown-body 中定义，避免在组件里写任意值类名。
 */

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'target', 'rel'],
    code: [...(defaultSchema.attributes?.code ?? []), 'className'],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
  },
}

const components: Components = {
  // 正文内的标题降级，避免破坏页面标题层级（PRD §8.4 第 2 条）
  h1: ({ children }) => <h2>{children}</h2>,
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  h4: ({ children }) => <h4>{children}</h4>,
  a: ({ href, children }) => {
    const isExternal = typeof href === 'string' && /^https?:\/\//i.test(href)
    if (!isExternal) return <a href={href}>{children}</a>
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only">（在新标签页打开）</span>
      </a>
    )
  },
  img: ({ src, alt }) => (
    // alt 缺省时标记为空字符串，明确为装饰性图片
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
}

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
