import { useRef } from 'react'
import type { ReactNode } from 'react'

export type TabItem = {
  id: string
  label: string
  content: ReactNode
}

/**
 * 标签页：使用 role="tablist" 与方向键切换，符合 WAI-ARIA 的 Tabs 模式。
 * 焦点管理采用"自动激活"策略（聚焦即切换）。
 */
export function Tabs({
  items,
  value,
  onChange,
  label,
}: {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  label: string
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === value),
  )

  function focusTab(index: number) {
    const next = items[index]
    if (!next) return
    onChange(next.id)
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons?.[index]?.focus()
  }

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        // 方向键处理挂在这一层，因此需要可编程聚焦点（tabIndex=-1 不进入 Tab 序列）
        tabIndex={-1}
        className="flex flex-wrap gap-1 border-b border-ink-700 focus-visible:focus-ring"
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            focusTab((activeIndex + 1) % items.length)
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault()
            focusTab((activeIndex - 1 + items.length) % items.length)
          } else if (event.key === 'Home') {
            event.preventDefault()
            focusTab(0)
          } else if (event.key === 'End') {
            event.preventDefault()
            focusTab(items.length - 1)
          }
        }}
      >
        {items.map((item) => {
          const selected = item.id === value
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.id)}
              className={[
                'min-h-11 rounded-t-control px-4 text-sm transition-colors duration-150 focus-visible:focus-ring motion-reduce:transition-none',
                selected
                  ? 'border-b-2 border-champagne-400 font-medium text-champagne-400'
                  : 'text-parchment-300 hover:text-parchment-100',
              ].join(' ')}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {items.map((item) =>
        item.id === value ? (
          <div
            key={item.id}
            role="tabpanel"
            id={`panel-${item.id}`}
            aria-labelledby={`tab-${item.id}`}
            tabIndex={0}
            className="pt-6 focus-visible:focus-ring"
          >
            {item.content}
          </div>
        ) : null,
      )}
    </div>
  )
}
