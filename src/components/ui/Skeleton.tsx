/** 懒加载与异步读取时的占位骨架 */
export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">正在加载内容</span>
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} className="h-4 rounded-full bg-ink-700" aria-hidden="true" />
      ))}
    </div>
  )
}

/** 页面级加载占位：与 PublicLayout 的内容宽度对齐 */
export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Skeleton lines={6} />
    </div>
  )
}
