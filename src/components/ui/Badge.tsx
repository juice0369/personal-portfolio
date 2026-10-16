import type { ReactNode } from 'react'

type BadgeTone = 'neutral' | 'accent' | 'muted' | 'danger'

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-ink-600 text-parchment-300',
  accent: 'border-champagne-400/60 text-champagne-400',
  muted: 'border-ink-700 text-parchment-500',
  danger: 'border-danger-400/60 text-danger-400',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap',
        TONES[tone],
        className,
      ]
        .filter((part) => part && part.length > 0)
        .join(' ')}
    >
      {children}
    </span>
  )
}

/** 技术栈 / 标签的简洁列表（无边框，仅淡色背景） */
export function TagList({ items, label }: { items: readonly string[]; label: string }) {
  if (items.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {items.map((item) => (
        <li key={item} className="rounded-full bg-ink-700 px-2.5 py-0.5 text-xs text-parchment-300">
          {item}
        </li>
      ))}
    </ul>
  )
}
