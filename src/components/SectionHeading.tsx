import type { ReactNode } from 'react'

/**
 * 区块标题：统一首页各区块的标题层级与留白。
 * 标题使用 h2，页面级唯一 h1 由各页面自己渲染。
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
}: {
  id?: string
  eyebrow?: string
  title: string
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-[52ch]">
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium tracking-[0.18em] text-champagne-400">{eyebrow}</p>
        ) : null}
        <h2
          id={id}
          className="text-2xl font-semibold tracking-tight text-parchment-100 sm:text-3xl"
        >
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm text-parchment-300">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
