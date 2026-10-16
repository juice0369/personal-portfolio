import { useMemo } from 'react'
import { Link } from 'react-router'
import { useContent } from '../../content/useContent'
import {
  selectPublishedPosts,
  selectRecentDrafts,
  selectRecentProjects,
  selectStats,
} from '../../content/selectors'
import { formatTimestamp, formatYearMonthRange } from '../../lib/date'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Badge } from '../../components/ui/Badge'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/PageHeader'

type StatCard = {
  key: string
  label: string
  value: number
  hint?: string
  to: string
  linkLabel: string
}

/** 仪表盘（F-14 / AC-F14）：概览数字 + 最近草稿 + 最近修改的项目 */
export function DashboardPage() {
  const { state } = useContent()
  useDocumentTitle('仪表盘')

  const stats = useMemo(() => selectStats(state), [state])
  const drafts = useMemo(() => selectRecentDrafts(state, 5), [state])
  const recentProjects = useMemo(() => selectRecentProjects(state, 3), [state])
  const publishedCount = useMemo(() => selectPublishedPosts(state).length, [state])
  const isEmpty =
    stats.skills === 0 && stats.projects === 0 && stats.posts === 0 && stats.timeline === 0

  const cards: StatCard[] = [
    {
      key: 'skills',
      label: '技能',
      value: stats.skills,
      hint: `${stats.skillCategories} 个分类`,
      to: '/admin/skills',
      linkLabel: '管理技能',
    },
    {
      key: 'projects',
      label: '项目',
      value: stats.projects,
      hint: `${state.projects.filter((project) => project.featured).length} 个首页精选`,
      to: '/admin/projects',
      linkLabel: '管理项目',
    },
    {
      key: 'posts',
      label: '文章',
      value: stats.posts,
      hint: `${publishedCount} 篇已发布 · ${stats.draftPosts} 篇草稿`,
      to: '/admin/posts',
      linkLabel: '管理文章',
    },
    {
      key: 'timeline',
      label: '经历记录',
      value: stats.timeline,
      hint: '教育与实践合计',
      to: '/admin/profile',
      linkLabel: '管理经历',
    },
  ]

  return (
    <div>
      <PageHeader
        title="仪表盘"
        description="当前内容概览。所有修改都会立即写入浏览器本地存储，前台无需刷新即可看到。"
        meta={`数据最后更新：${formatTimestamp(state.updatedAt)}`}
        action={
          <ButtonLink to="/admin/posts/new" variant="secondary" size="sm">
            写一篇新文章
          </ButtonLink>
        }
      />

      {isEmpty ? (
        <EmptyState
          title="还没有任何内容"
          description="可以直接修改内置的示例数据：从新增一项技能开始，或前往个人信息修改姓名与简介。"
          action={
            <ButtonLink to="/admin/skills" variant="secondary">
              去新增技能
            </ButtonLink>
          }
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.key} className="flex flex-col">
            <p className="text-xs text-parchment-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-champagne-200 tabular-nums">
              {card.value}
            </p>
            {card.hint ? <p className="mt-1 text-xs text-parchment-500">{card.hint}</p> : null}
            <Link
              to={card.to}
              className="mt-4 inline-flex min-h-11 items-center text-sm text-champagne-400 hover:text-champagne-200 focus-visible:focus-ring"
            >
              {card.linkLabel}
            </Link>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card as="section">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-parchment-100">最近的草稿</h2>
            <ButtonLink to="/admin/posts" variant="ghost" size="sm">
              查看全部文章
            </ButtonLink>
          </div>

          {drafts.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-parchment-300">
              没有草稿。已发布的文章可以在前台「博客」页面查看。
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-700">
              {drafts.map((post) => (
                <li key={post.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                  <Link
                    to={`/admin/posts/${encodeURIComponent(post.id)}/edit`}
                    className="min-w-0 flex-1 truncate rounded-control text-sm text-parchment-100 hover:text-champagne-200 focus-visible:focus-ring"
                  >
                    {post.title}
                  </Link>
                  <Badge tone="danger">草稿</Badge>
                  <span className="text-xs text-parchment-500 tabular-nums">
                    {formatTimestamp(post.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card as="section">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-parchment-100">最近修改的项目</h2>
            <ButtonLink to="/admin/projects" variant="ghost" size="sm">
              查看全部项目
            </ButtonLink>
          </div>

          {recentProjects.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-parchment-300">
              还没有项目。新增第一个项目后，首页「精选项目」区块会立即显示它。
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-700">
              {recentProjects.map((project) => (
                <li key={project.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                  <Link
                    to="/admin/projects"
                    className="min-w-0 flex-1 truncate rounded-control text-sm text-parchment-100 hover:text-champagne-200 focus-visible:focus-ring"
                  >
                    {project.title}
                  </Link>
                  {project.featured ? <Badge tone="accent">首页精选</Badge> : null}
                  <span className="text-xs text-parchment-500 tabular-nums">
                    {formatYearMonthRange(project.startDate, project.endDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6" as="section">
        <h2 className="text-base font-semibold text-parchment-100">数据备份提醒</h2>
        <p className="mt-2 max-w-[70ch] text-sm leading-7 text-parchment-300">
          内容保存在当前浏览器（localStorage），头像与简历保存在 IndexedDB，均为未加密的本地数据。
          清理浏览器数据、更换浏览器或更换设备都会导致内容丢失，建议定期导出 JSON 备份。
          导出的文件不包含头像与简历的二进制内容，在新设备上导入后需要重新上传这两个文件。
        </p>
        <div className="mt-4">
          <ButtonLink to="/admin/settings" variant="secondary" size="sm">
            前往站点设置导出数据
          </ButtonLink>
        </div>
      </Card>
    </div>
  )
}
