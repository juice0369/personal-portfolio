/**
 * 跳到主要内容（PRD §8.4 第 1 条）。
 * 默认视觉隐藏，获得焦点时显示在左上角。
 */
export function SkipLink({ targetId = 'main' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-control focus:border focus:border-ink-600 focus:bg-ink-800 focus:px-4 focus:text-sm focus:text-parchment-100 focus-visible:focus-ring"
    >
      跳到主要内容
    </a>
  )
}
