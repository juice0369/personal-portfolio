import { IconChevronLeft, IconChevronRight } from '../icons'
import { Button } from './Button'

/**
 * 分页：通过回调把页码写入查询参数（AC-F07），不使用内部状态。
 * 当前页用 aria-current 标注，屏幕阅读器可感知。
 */
export function Pagination({
  page,
  totalPages,
  onChange,
  label = '文章分页',
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
  label?: string
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav aria-label={label} className="mt-8">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
          >
            <IconChevronLeft />
            上一页
          </Button>
        </li>
        {pages.map((item) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={[
                'inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border px-3 text-sm transition-colors duration-150 focus-visible:focus-ring motion-reduce:transition-none',
                item === page
                  ? 'border-champagne-400 bg-champagne-400 text-ink-900'
                  : 'border-ink-600 bg-ink-800 text-parchment-300 hover:text-parchment-100',
              ].join(' ')}
            >
              {item}
            </button>
          </li>
        ))}
        <li>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onChange(page + 1)}
          >
            下一页
            <IconChevronRight />
          </Button>
        </li>
      </ul>
    </nav>
  )
}
