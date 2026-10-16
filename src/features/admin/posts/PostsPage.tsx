import { useMemo } from 'react'
import { Link } from 'react-router'
import { useContent } from '../../../content/useContent'
import { selectDraftPosts, selectPublishedPosts } from '../../../content/selectors'
import { formatIsoDate, formatTimestamp } from '../../../lib/date'
import { estimateReadingMinutes } from '../../../lib/markdown/reading-time'
import type { Post } from '../../../lib/schema'
import { useConfirm } from '../../../hooks/confirm-context'
import { useToast } from '../../../hooks/toast-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { Badge, TagList } from '../../../components/ui/Badge'
import { ButtonLink, IconButton } from '../../../components/ui/Button'
import { buttonClass } from '../../../components/ui/button-styles'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/PageHeader'
import { IconExternalLink, IconPencil, IconPlus, IconTrash } from '../../../components/icons'

/** 博客管理（F-18）：文章列表 + 跳转到整页编辑器 */
export function PostsPage() {
  const { state, dispatch } = useContent()
  const { pushToast } = useToast()
  const confirm = useConfirm()
  useDocumentTitle('博客管理')

  const published = useMemo(() => selectPublishedPosts(state), [state])
  const drafts = useMemo(() => selectDraftPosts(state), [state])
  const allPosts = useMemo(() => [...published, ...drafts], [published, drafts])

  async function handleDelete(post: Post) {
    const confirmed = await confirm({
      title: `删除文章「${post.title}」？`,
      description:
        post.status === 'published'
          ? '删除后前台博客列表与详情页都会立即消失，直接访问它的地址会显示未找到。删除后可在提示中点击「撤销」恢复。'
          : '这是一篇草稿，删除后不会影响前台。删除后可在提示中点击「撤销」恢复。',
      confirmLabel: `删除「${post.title}」`,
    })
    if (!confirmed) return

    dispatch({ type: 'removePost', id: post.id })
    pushToast({
      level: 'success',
      message: `已删除「${post.title}」`,
      action: { label: '撤销', onClick: () => dispatch({ type: 'addPost', post }) },
    })
  }

  return (
    <div>
      <PageHeader
        title="博客管理"
        description="草稿不会出现在前台。已发布文章按发布日期倒序展示在 /blog，支持按标签筛选与分页。"
        meta={`共 ${allPosts.length} 篇：${published.length} 篇已发布 · ${drafts.length} 篇草稿`}
        action={
          <ButtonLink to="/admin/posts/new">
            <IconPlus />
            新建文章
          </ButtonLink>
        }
      />

      {allPosts.length === 0 ? (
        <EmptyState
          title="还没有文章"
          description="点击「新建文章」写第一篇。正文使用 Markdown，右侧可以实时预览。"
          action={
            <ButtonLink to="/admin/posts/new" variant="secondary">
              新建文章
            </ButtonLink>
          }
        />
      ) : (
        <Card as="section" className="p-0">
          <ul className="divide-y divide-ink-700">
            {allPosts.map((post) => (
              <li key={post.id} className="flex flex-wrap items-start gap-3 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Link
                      to={`/admin/posts/${encodeURIComponent(post.id)}/edit`}
                      className="rounded-control text-sm font-medium text-parchment-100 hover:text-champagne-200 focus-visible:focus-ring"
                    >
                      {post.title}
                    </Link>
                    {post.status === 'draft' ? (
                      <Badge tone="danger">草稿</Badge>
                    ) : (
                      <Badge tone="accent">已发布</Badge>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-parchment-500">
                    <span className="tabular-nums">发布 {formatIsoDate(post.publishedAt)}</span>
                    <span className="mx-2">·</span>
                    <span className="tabular-nums">最后修改 {formatTimestamp(post.updatedAt)}</span>
                    <span className="mx-2">·</span>约 {estimateReadingMinutes(post.content)} 分钟
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-parchment-500">
                    {post.summary}
                  </p>

                  {post.tags.length > 0 ? (
                    <div className="mt-2">
                      <TagList items={post.tags} label={`${post.title}的标签`} />
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {post.status === 'published' ? (
                    <Link
                      to={`/blog/${encodeURIComponent(post.slug)}`}
                      className="inline-flex min-h-11 items-center gap-1 rounded-control px-3 text-xs text-parchment-300 hover:text-champagne-200 focus-visible:focus-ring"
                    >
                      <IconExternalLink />
                      查看
                    </Link>
                  ) : null}
                  <Link
                    to={`/admin/posts/${encodeURIComponent(post.id)}/edit`}
                    aria-label={`编辑「${post.title}」`}
                    title={`编辑「${post.title}」`}
                    className={buttonClass({ variant: 'ghost', size: 'sm' })}
                  >
                    <IconPencil />
                  </Link>
                  <IconButton
                    label={`删除「${post.title}」`}
                    onClick={() => void handleDelete(post)}
                  >
                    <IconTrash />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
