export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'

/**
 * 按钮类名集中在一处，保证所有入口的焦点态、触控目标与对比度一致。
 * 触控目标：所有尺寸的按钮最小高度均为 44px（AC-X04）。
 * 焦点态：:focus-visible 时显示香槟金 2px 焦点环（index.css 的 focus-ring 工具类）。
 */
export function buttonClass(options?: {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  className?: string
}): string {
  const variant = options?.variant ?? 'primary'
  const size = options?.size ?? 'md'

  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-control font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-60'

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 text-sm',
    md: 'px-4 text-sm sm:text-[0.9375rem]',
  }

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-champagne-400 text-ink-900 hover:bg-champagne-200',
    secondary: 'border border-ink-600 bg-ink-800 text-parchment-100 hover:border-champagne-400',
    ghost: 'text-parchment-300 hover:bg-ink-800 hover:text-parchment-100',
    danger: 'bg-danger-400 text-ink-900 hover:opacity-90',
  }

  return [base, sizes[size], variants[variant], options?.block ? 'w-full' : '', options?.className]
    .filter((part) => part && part.length > 0)
    .join(' ')
}
