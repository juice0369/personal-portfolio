import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { useContent } from '../../content/useContent'
import { selectAdjacentPosts, selectPostBySlug } from '../../content/selectors'
import { formatIsoDate } from '../../lib/date'
import { estimateReadingMinutes } from '../../lib/markdown/reading-time'
import { decodeSlug } from '../../lib/slug'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { MarkdownView } from '../../components/MarkdownView'
import { PageHeader } from '../../components/PageHeader'
import { TagList } from '../../components/ui/Badge'
import { ButtonLink } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconChevronLeft, IconChevronRight } from '../../components/icons'

/**
 * 博客详情页（F-08 / AC-F08）。
 *
 * 草稿在前台不可访问：`status !== 'published'` 时渲染未找到页面，
 * 与"文章被删除"共用同一个空态，避免通过地址直接读到未发布内容。
 */
export function PostDetailPage() {
  const params = useParams()
  const { state } = useContent()
  const slug = decodeSlug(params.slug)
  const post = useMemo(() => selectPostBySlug(state, slug), [state, slug])
  const visible = post !== undefined && post.status === 'published' ? post : undefined

  const adjacent = useMemo(
    () =>
      visible === undefined ? { previous: null, next: null } : selectAdjacentPosts(state, slug),
    [state, slug, visible],
  )

  useDocumentTitle(visible?.title ?? '文章未找到')

  if (visible === undefined) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <EmptyState
          title="没有找到这篇文章"
          headingLevel="h1"
          description={`地址中的标识「${slug}」在当前内容中不存在，或这篇文章仍是草稿状态（草稿不在前台展示）。`}
          action={
            <ButtonLink to="/blog" variant="secondary">
              返回博客列表
            </ButtonLink>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        to="/blog"
        className="mb-6 inline-flex min-h-11 items-center gap-1 rounded-control text-sm text-parchment-300 hover:text-champagne-200 focus-visible:focus-ring"
      >
        <IconChevronLeft />
        返回博客列表
      </Link>

      <PageHeader
        title={visible.title}
        meta={`${formatIsoDate(visible.publishedAt)} · 约 ${estimateReadingMinutes(
          visible.content,
        )} 分钟`}
        description={visible.summary}
      />

      {visible.tags.length > 0 ? (
        <div className="mb-8">
          <TagList items={visible.tags} label={`${visible.title}的标签`} />
        </div>
      ) : null}

      <article>
        <MarkdownView content={visible.content} />
      </article>

      {adjacent.previous === null && adjacent.next === null ? null : (
        <nav
          aria-label="文章导航"
          className="mt-10 grid gap-3 border-t border-ink-700 pt-6 sm:grid-cols-2"
        >
          {adjacent.previous !== null ? (
            <Link
              to={`/blog/${encodeURIComponent(adjacent.previous.slug)}`}
              className="rounded-card border border-ink-700 bg-ink-800 p-4 hover:border-champagne-400/50 focus-visible:focus-ring"
            >
              <span className="flex items-center gap-1 text-xs text-parchment-500">
                <IconChevronLeft />
                更新的一篇
              </span>
              <span className="mt-1 block text-sm font-medium text-parchment-100">
                {adjacent.previous.title}
              </span>
            </Link>
          ) : null}
          {adjacent.next !== null ? (
            <Link
              to={`/blog/${encodeURIComponent(adjacent.next.slug)}`}
              className="rounded-card border border-ink-700 bg-ink-800 p-4 hover:border-champagne-400/50 focus-visible:focus-ring sm:col-start-2 sm:text-right"
            >
              <span className="flex items-center gap-1 text-xs text-parchment-500 sm:justify-end">
                更早的一篇
                <IconChevronRight />
              </span>
              <span className="mt-1 block text-sm font-medium text-parchment-100">
                {adjacent.next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      )}
    </div>
  )
}
