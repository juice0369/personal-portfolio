/**
 * 标签筛选（AC-F07）：点击标签把选择写入查询参数 `/blog?tag=前端`，
 * 刷新与前进后退都能还原筛选状态，因此这里不维护内部状态。
 */
export function TagFilter({
  tags,
  activeTag,
  totalCount,
  counts,
  onChange,
}: {
  tags: readonly string[]
  activeTag: string | null
  totalCount: number
  counts: ReadonlyMap<string, number>
  onChange: (tag: string | null) => void
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs text-parchment-500">按标签筛选：</span>
      <button
        type="button"
        aria-pressed={activeTag === null}
        onClick={() => onChange(null)}
        className={[
          'inline-flex min-h-11 items-center rounded-control border px-3 text-sm focus-visible:focus-ring',
          activeTag === null
            ? 'border-champagne-400 text-champagne-400'
            : 'border-ink-600 text-parchment-300 hover:text-parchment-100',
        ].join(' ')}
      >
        全部（{totalCount}）
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={activeTag === tag}
          onClick={() => onChange(tag)}
          className={[
            'inline-flex min-h-11 items-center rounded-control border px-3 text-sm focus-visible:focus-ring',
            activeTag === tag
              ? 'border-champagne-400 text-champagne-400'
              : 'border-ink-600 text-parchment-300 hover:text-parchment-100',
          ].join(' ')}
        >
          {tag}（{counts.get(tag) ?? 0}）
        </button>
      ))}
    </div>
  )
}
