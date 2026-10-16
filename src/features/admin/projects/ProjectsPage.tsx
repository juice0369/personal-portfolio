import { useMemo, useState } from 'react'
import { useContent } from '../../../content/useContent'
import { selectProjects } from '../../../content/selectors'
import { createId } from '../../../lib/id'
import type { Project } from '../../../lib/schema'
import { nowTimestamp } from '../../../lib/date'
import { useConfirm } from '../../../hooks/confirm-context'
import { useToast } from '../../../hooks/toast-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/PageHeader'
import { IconPlus } from '../../../components/icons'
import { ProjectFormDrawer, type ProjectDraft } from './ProjectFormDrawer'
import { ProjectTable } from './ProjectTable'

/** 项目管理（F-17）：新增、修改、删除、调整顺序 */
export function ProjectsPage() {
  const { state, dispatch } = useContent()
  const { pushToast } = useToast()
  const confirm = useConfirm()
  useDocumentTitle('项目管理')

  const [editing, setEditing] = useState<{ project: Project | null } | null>(null)

  const projects = useMemo(() => selectProjects(state), [state])

  function handleSubmit(draft: ProjectDraft, meta: { slugGenerated: boolean }) {
    if (editing === null) return

    if (editing.project === null) {
      dispatch({
        type: 'addProject',
        project: {
          ...draft,
          id: createId(),
          order: state.projects.length,
          updatedAt: nowTimestamp(),
        },
      })
      pushToast({
        level: 'success',
        message: meta.slugGenerated
          ? `已新增项目，并自动生成地址标识 ${draft.slug}`
          : '已新增项目，前台会立即显示',
      })
    } else {
      dispatch({ type: 'updateProject', id: editing.project.id, patch: draft })
      pushToast({
        level: 'success',
        message: meta.slugGenerated
          ? `已保存，并自动生成地址标识 ${draft.slug}`
          : '已保存项目修改，前台会立即更新',
      })
    }
    setEditing(null)
  }

  async function handleDelete(project: Project) {
    const confirmed = await confirm({
      title: `删除项目「${project.title}」？`,
      description:
        '删除后该项目会从首页精选与项目列表中消失，直接访问它的详情地址会显示未找到。删除后可在提示中点击「撤销」恢复。',
      confirmLabel: `删除「${project.title}」`,
    })
    if (!confirmed) return

    dispatch({ type: 'removeProject', id: project.id })
    pushToast({
      level: 'success',
      message: `已删除「${project.title}」`,
      action: { label: '撤销', onClick: () => dispatch({ type: 'addProject', project }) },
    })
  }

  function move(project: Project, direction: -1 | 1) {
    const index = projects.findIndex((item) => item.id === project.id)
    const target = projects[index + direction]
    if (!target) return

    dispatch({ type: 'updateProject', id: project.id, patch: { order: target.order } })
    dispatch({ type: 'updateProject', id: target.id, patch: { order: project.order } })
    pushToast({ level: 'info', message: '已调整顺序，前台项目顺序同步更新' })
  }

  return (
    <div>
      <PageHeader
        title="项目管理"
        description="项目会出现在 /projects 列表与详情页；勾选「首页精选」的项目还会出现在首页。"
        action={
          <Button onClick={() => setEditing({ project: null })}>
            <IconPlus />
            新增项目
          </Button>
        }
      />

      <Card as="section">
        {projects.length === 0 ? (
          <EmptyState
            title="还没有项目"
            description="点击右上角「新增项目」添加第一个项目，填写摘要与实践过程。"
            action={
              <Button variant="secondary" onClick={() => setEditing({ project: null })}>
                新增项目
              </Button>
            }
          />
        ) : (
          <ProjectTable
            projects={projects}
            onEdit={(project) => setEditing({ project })}
            onDelete={(project) => void handleDelete(project)}
            onMove={move}
          />
        )}
      </Card>

      {editing !== null ? (
        <ProjectFormDrawer
          project={editing.project}
          takenSlugs={state.projects
            .filter((project) => project.id !== editing.project?.id)
            .map((project) => project.slug)}
          onClose={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  )
}
