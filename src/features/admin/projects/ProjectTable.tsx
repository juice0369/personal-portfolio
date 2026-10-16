import { Link } from 'react-router'
import { formatTimestamp, formatYearMonthRange } from '../../../lib/date'
import type { Project } from '../../../lib/schema'
import { Badge } from '../../../components/ui/Badge'
import { IconButton } from '../../../components/ui/Button'
import {
  IconArrowDown,
  IconArrowUp,
  IconExternalLink,
  IconPencil,
  IconTrash,
} from '../../../components/icons'

/**
 * 项目列表。
 * 桌面端为表格，移动端把每一行折成卡片式布局（同一份 DOM，用响应式类名切换排列）。
 */
export function ProjectTable({
  projects,
  onEdit,
  onDelete,
  onMove,
}: {
  projects: readonly Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onMove: (project: Project, direction: -1 | 1) => void
}) {
  return (
    <ul className="divide-y divide-ink-700">
      {projects.map((project, index) => (
        <li key={project.id} className="flex flex-wrap items-center gap-3 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-sm font-medium text-parchment-100">{project.title}</span>
              {project.featured ? <Badge tone="accent">首页精选</Badge> : null}
              {project.category.length > 0 ? <Badge tone="muted">{project.category}</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-parchment-500">
              <span className="tabular-nums">
                {formatYearMonthRange(project.startDate, project.endDate)}
              </span>
              <span className="mx-2">·</span>
              <span className="tabular-nums">最后修改 {formatTimestamp(project.updatedAt)}</span>
            </p>
            <p className="mt-1 text-xs text-parchment-500">/projects/{project.slug}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              to={`/projects/${encodeURIComponent(project.slug)}`}
              className="inline-flex min-h-11 items-center gap-1 rounded-control px-3 text-xs text-parchment-300 hover:text-champagne-200 focus-visible:focus-ring"
            >
              <IconExternalLink />
              查看
            </Link>
            <IconButton
              label={`上移「${project.title}」`}
              disabled={index === 0}
              onClick={() => onMove(project, -1)}
            >
              <IconArrowUp />
            </IconButton>
            <IconButton
              label={`下移「${project.title}」`}
              disabled={index === projects.length - 1}
              onClick={() => onMove(project, 1)}
            >
              <IconArrowDown />
            </IconButton>
            <IconButton label={`编辑「${project.title}」`} onClick={() => onEdit(project)}>
              <IconPencil />
            </IconButton>
            <IconButton label={`删除「${project.title}」`} onClick={() => onDelete(project)}>
              <IconTrash />
            </IconButton>
          </div>
        </li>
      ))}
    </ul>
  )
}
