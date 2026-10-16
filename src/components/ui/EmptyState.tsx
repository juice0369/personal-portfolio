import type { ReactNode } from 'react'

/**
 * 空态：文案给出下一步动作建议，不留空白区域（AGENTS.md §4.5）。
 *
 * `headingLevel` 用于决定标题标签：区块内的空态用默认的 `p`，
 * 整个页面只有空态时传 `h1`，保证每页恰好一个一级标题（TECH_DESIGN §9.4）。
 */
export function EmptyState({
  title,
  description,
  action,
  headingLevel = 'p',
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  headingLevel?: 'p' | 'h1' | 'h2'
}) {
  const Heading = headingLevel

  return (
    <div className="rounded-card border border-dashed border-ink-600 bg-ink-800/60 px-5 py-10 text-center">
      <Heading className="text-base font-medium text-parchment-100">{title}</Heading>
      {description ? (
        <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-6 text-parchment-300">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}
