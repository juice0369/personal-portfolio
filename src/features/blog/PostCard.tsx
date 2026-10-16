import { Link } from 'react-router'
import { formatIsoDate } from '../../lib/date'
import { estimateReadingMinutes } from '../../lib/markdown/reading-time'
import type { Post } from '../../lib/schema'
import { TagList } from '../../components/ui/Badge'
import { IconChevronRight } from '../../components/icons'

/**
 * 文章卡片。
 *
 * 与项目卡片相同的做法：标题链接通过 after 伪元素铺满整张卡片，
 * 整张卡片只有一个可聚焦元素，键盘与屏幕阅读器体验更好。
 * 摘要固定截断三行，长摘要不会撑破移动端布局（AC-F07）。
 */
export function PostCard({ post }: { post: Post }) {
  return (
    <article className="relative flex flex-col rounded-card border border-ink-700 bg-ink-800 p-5 shadow-panel transition-colors duration-150 hover:border-champagne-400/50 motion-reduce:transition-none">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-parchment-500">
        <time dateTime={post.publishedAt} className="tabular-nums">
          {formatIsoDate(post.publishedAt)}
        </time>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">约 {estimateReadingMinutes(post.content)} 分钟</span>
      </div>

      <h2 className="mt-3 text-lg font-semibold text-parchment-100">
        <Link
          to={`/blog/${encodeURIComponent(post.slug)}`}
          className="rounded-control after:absolute after:inset-0 after:content-[''] hover:text-champagne-200 focus-visible:focus-ring"
        >
          {post.title}
        </Link>
      </h2>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-parchment-300">{post.summary}</p>

      {post.tags.length > 0 ? (
        <div className="mt-4">
          <TagList items={post.tags} label={`${post.title}的标签`} />
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-1 border-t border-ink-700 pt-3 text-xs text-champagne-400">
        阅读全文
        <IconChevronRight />
      </div>
    </article>
  )
}
