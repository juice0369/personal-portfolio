import { Link } from 'react-router'
import { formatYearMonthRange } from '../../lib/date'
import type { Project } from '../../lib/schema'
import { Badge, TagList } from '../../components/ui/Badge'
import { IconExternalLink } from '../../components/icons'

/**
 * 项目卡片。
 *
 * 标题链接通过 after 伪元素铺满整张卡片，做到"点击卡片任意位置可进入详情"，
 * 同时整张卡片只有一个可聚焦元素，键盘与屏幕阅读器体验更好。
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="relative flex flex-col rounded-card border border-ink-700 bg-ink-800 p-5 shadow-panel transition-colors duration-150 hover:border-champagne-400/50 motion-reduce:transition-none">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {project.category.length > 0 ? <Badge tone="muted">{project.category}</Badge> : null}
        <span className="text-xs text-parchment-500 tabular-nums">
          {formatYearMonthRange(project.startDate, project.endDate)}
        </span>
        {project.featured ? <Badge tone="accent">首页精选</Badge> : null}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-parchment-100">
        <Link
          to={`/projects/${encodeURIComponent(project.slug)}`}
          className="rounded-control after:absolute after:inset-0 after:content-[''] hover:text-champagne-200 focus-visible:focus-ring"
        >
          {project.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-parchment-300">{project.summary}</p>

      {project.techStack.length > 0 ? (
        <div className="mt-3">
          <TagList items={project.techStack} label={`${project.title}使用的技术`} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-ink-700 pt-3 text-xs text-parchment-500">
        {project.role.length > 0 ? <span>职责：{project.role}</span> : null}
        {project.repoUrl !== null || project.demoUrl !== null ? (
          <span className="ml-auto inline-flex items-center gap-1 text-champagne-400">
            <IconExternalLink />
            含外部链接
          </span>
        ) : null}
      </div>
    </article>
  )
}
