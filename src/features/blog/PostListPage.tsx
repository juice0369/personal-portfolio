import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { useContent } from '../../content/useContent'
import { paginate, selectPostTags, selectPublishedPosts, totalPages } from '../../content/selectors'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ButtonLink } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Pagination } from '../../components/ui/Pagination'
import { PageHeader } from '../../components/PageHeader'
import { PostCard } from './PostCard'
import { TagFilter } from './TagFilter'

/**
 * 博客列表页（F-07 / AC-F07）。
 *
 * 筛选与分页状态全部存放在查询参数里（`?tag=`、`?page=`），
 * 因此刷新页面、复制地址、前进后退都能还原到同一视图，组件本身不持有这些状态。
 * 只有 status 为 published 的文章会被展示，草稿在前台不可见。
 */
export function PostListPage() {
  const { state } = useContent()
  const [searchParams, setSearchParams] = useSearchParams()
  useDocumentTitle('博客')

  const published = useMemo(() => selectPublishedPosts(state), [state])
  const tags = useMemo(() => selectPostTags(state), [state])
  const perPage = state.settings.postsPerPage

  // 每个标签的文章数，用于在筛选按钮上显示数量
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of published) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return counts
  }, [published])

  const activeTag = searchParams.get('tag')
  const filtered = useMemo(
    () =>
      activeTag === null ? published : published.filter((post) => post.tags.includes(activeTag)),
    [published, activeTag],
  )

  const pageCount = totalPages(filtered.length, perPage)
  const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pageCount) : 1
  const visible = useMemo(() => paginate(filtered, page, perPage), [filtered, page, perPage])

  const updateParams = useCallback(
    (next: { tag?: string | null; page?: number }) => {
      const params = new URLSearchParams(searchParams)
      if ('tag' in next) {
        if (next.tag === null || next.tag === undefined) {
          params.delete('tag')
        } else {
          params.set('tag', next.tag)
        }
        // 切换标签后回到第一页，避免停留在已不存在的页码上
        params.delete('page')
      }
      if (next.page !== undefined) {
        if (next.page <= 1) {
          params.delete('page')
        } else {
          params.set('page', String(next.page))
        }
      }
      setSearchParams(params)
    },
    [searchParams, setSearchParams],
  )

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        title="博客"
        description="记录实现过程中的取舍与踩过的坑。"
        meta={
          published.length === 0
            ? undefined
            : `共 ${published.length} 篇已发布文章 · 每页 ${perPage} 篇`
        }
      />

      {published.length === 0 ? (
        <EmptyState
          title="还没有已发布的文章"
          description="在后台「博客」页面新建文章并保存为已发布状态，它就会出现在这里；草稿不会显示。"
          action={
            <ButtonLink to="/admin/posts" variant="secondary">
              前往后台写文章
            </ButtonLink>
          }
        />
      ) : (
        <>
          {tags.length > 1 ? (
            <TagFilter
              tags={tags}
              activeTag={activeTag}
              totalCount={published.length}
              counts={tagCounts}
              onChange={(tag) => updateParams({ tag })}
            />
          ) : null}

          {visible.length === 0 ? (
            <EmptyState
              title={activeTag === null ? '暂时没有文章' : `没有标签为「${activeTag}」的文章`}
              description="可以清除筛选查看全部文章，或在后台为文章补充标签。"
              action={
                activeTag === null ? (
                  <ButtonLink to="/" variant="secondary">
                    返回首页
                  </ButtonLink>
                ) : (
                  // Link 的 to 不含查询参数，因此点击后自动回到未筛选状态
                  <ButtonLink to="/blog" variant="secondary">
                    查看全部文章
                  </ButtonLink>
                )
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {visible.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={pageCount}
            label="文章分页"
            onChange={(next) => updateParams({ page: next })}
          />
        </>
      )}
    </div>
  )
}
