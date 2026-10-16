import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { useContent } from '../../content/useContent'
import { selectProjectBySlug } from '../../content/selectors'
import { formatYearMonthRange } from '../../lib/date'
import { decodeSlug } from '../../lib/slug'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { MarkdownView } from '../../components/MarkdownView'
import { PageHeader } from '../../components/PageHeader'
import { Badge, TagList } from '../../components/ui/Badge'
import { ButtonLink, ExternalLinkButton } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconChevronLeft, IconExternalLink } from '../../components/icons'

/** 项目详情页（F-06 / AC-F06）：背景、职责、时间、技术栈、成果要点与 Markdown 正文 */
export function ProjectDetailPage() {
  const params = useParams()
  const { state } = useContent()
  const slug = decodeSlug(params.slug)
  const project = useMemo(() => selectProjectBySlug(state, slug), [state, slug])

  useDocumentTitle(project?.title ?? '项目未找到')

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <EmptyState
          title="没有找到这个项目"
          headingLevel="h1"
          description={`地址中的标识「${slug}」在当前数据中不存在，可能是项目已被删除或链接有误。`}
          action={
            <ButtonLink to="/projects" variant="secondary">
              返回项目列表
            </ButtonLink>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        to="/projects"
        className="mb-6 inline-flex min-h-11 items-center gap-1 rounded-control text-sm text-parchment-300 hover:text-champagne-200 focus-visible:focus-ring"
      >
        <IconChevronLeft />
        返回项目列表
      </Link>

      <PageHeader
        title={project.title}
        meta={`${formatYearMonthRange(project.startDate, project.endDate)}${
          project.category.length > 0 ? ` · ${project.category}` : ''
        }`}
        description={project.summary}
      />

      <dl className="mb-8 grid gap-4 sm:grid-cols-2">
        {project.role.length > 0 ? (
          <div className="rounded-card border border-ink-700 bg-ink-800 p-4">
            <dt className="text-xs text-parchment-500">我的职责</dt>
            <dd className="mt-1 text-sm text-parchment-100">{project.role}</dd>
          </div>
        ) : null}
        <div className="rounded-card border border-ink-700 bg-ink-800 p-4">
          <dt className="text-xs text-parchment-500">起止时间</dt>
          <dd className="mt-1 text-sm text-parchment-100 tabular-nums">
            {formatYearMonthRange(project.startDate, project.endDate)}
          </dd>
        </div>
      </dl>

      {project.techStack.length > 0 ? (
        <section aria-labelledby="project-tech" className="mb-8">
          <h2 id="project-tech" className="mb-3 text-base font-semibold text-parchment-100">
            技术栈
          </h2>
          <TagList items={project.techStack} label="技术栈" />
        </section>
      ) : null}

      {project.highlights.length > 0 ? (
        <section aria-labelledby="project-highlights" className="mb-8">
          <h2 id="project-highlights" className="mb-3 text-base font-semibold text-parchment-100">
            成果要点
          </h2>
          <ul className="space-y-2">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 text-sm leading-6 text-parchment-300">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne-400"
                />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {project.content.trim().length > 0 ? (
        <section aria-labelledby="project-content" className="mb-8">
          <h2 id="project-content" className="mb-3 text-base font-semibold text-parchment-100">
            项目过程
          </h2>
          <MarkdownView content={project.content} />
        </section>
      ) : null}

      {project.repoUrl !== null || project.demoUrl !== null ? (
        <section aria-labelledby="project-links" className="border-t border-ink-700 pt-6">
          <h2 id="project-links" className="mb-3 text-base font-semibold text-parchment-100">
            相关链接
          </h2>
          <div className="flex flex-wrap gap-3">
            {project.repoUrl !== null ? (
              <ExternalLinkButton href={project.repoUrl} variant="secondary">
                <IconExternalLink />
                代码仓库
                <span className="sr-only">（在新标签页打开）</span>
              </ExternalLinkButton>
            ) : null}
            {project.demoUrl !== null ? (
              <ExternalLinkButton href={project.demoUrl} variant="secondary">
                <IconExternalLink />
                在线演示
                <span className="sr-only">（在新标签页打开）</span>
              </ExternalLinkButton>
            ) : null}
          </div>
        </section>
      ) : (
        <p className="border-t border-ink-700 pt-6 text-xs text-parchment-500">
          <Badge tone="muted">暂无公开链接</Badge>
          <span className="ml-2">这个项目没有可公开访问的仓库或演示地址。</span>
        </p>
      )}
    </div>
  )
}
