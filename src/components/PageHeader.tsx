/** 内页标题：每个页面仅一个 h1，并统一留白 */
export function PageHeader({
  title,
  description,
  meta,
  action,
}: {
  title: string
  description?: string
  meta?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-ink-700 pb-6">
      <div className="max-w-[62ch]">
        <h1 className="text-2xl font-semibold tracking-tight text-parchment-100 sm:text-3xl">
          {title}
        </h1>
        {meta ? <p className="mt-2 text-xs text-parchment-500 tabular-nums">{meta}</p> : null}
        {description ? (
          <p className="mt-3 text-sm leading-6 text-parchment-300">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
