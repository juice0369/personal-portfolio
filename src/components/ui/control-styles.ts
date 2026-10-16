/**
 * 输入类控件的公共样式。
 * 边框使用 ink-600（对 #0B0B0D 约 3.4:1），满足非文本对比度 3:1（PRD §8.4）。
 */
export function controlClass(options?: { invalid?: boolean; className?: string }): string {
  const base =
    'w-full min-h-11 rounded-control border bg-ink-900 px-3 py-2 text-sm text-parchment-100 placeholder:text-parchment-500 transition-colors duration-150 motion-reduce:transition-none focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-60'
  const border = options?.invalid ? 'border-danger-400' : 'border-ink-600'
  return [base, border, options?.className].filter((part) => part && part.length > 0).join(' ')
}
