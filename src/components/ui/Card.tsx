import type { ReactNode } from 'react'

/** 不透明面板：承托正文与表单，保证星空背景不会落到文字后面（PRD §8.3） */
export function Card({
  children,
  className,
  as: Element = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  return (
    <Element
      className={['rounded-card border border-ink-700 bg-ink-800 p-5 shadow-panel', className]
        .filter((part) => part && part.length > 0)
        .join(' ')}
    >
      {children}
    </Element>
  )
}
