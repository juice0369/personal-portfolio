import { useMemo } from 'react'
import { useContent } from '../../content/useContent'
import { selectFeaturedProjects } from '../../content/selectors'
import { ButtonLink } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { SectionHeading } from '../../components/SectionHeading'
import { ProjectCard } from '../projects/ProjectCard'

/** 首页精选项目（F-04 / AC-F04）：最多 3 个，按 order 排序 */
export function ProjectsPreviewSection() {
  const { state } = useContent()
  const featured = useMemo(() => selectFeaturedProjects(state, 3), [state])

  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24">
      <SectionHeading
        eyebrow="作品"
        id="projects-title"
        title="精选项目"
        description="首页最多展示 3 个标记为精选的项目，完整列表在项目页。"
        action={
          state.projects.length > 0 ? (
            <ButtonLink to="/projects" variant="secondary" size="sm">
              查看全部项目
            </ButtonLink>
          ) : null
        }
      />

      {featured.length === 0 ? (
        <EmptyState
          title={state.projects.length === 0 ? '还没有项目' : '没有标记为精选的项目'}
          description={
            state.projects.length === 0
              ? '在后台「项目」页面新增第一个项目，或在项目上勾选"首页精选"。'
              : '在后台「项目」页面勾选"首页精选"，即可让项目出现在首页。'
          }
          action={
            state.projects.length > 0 ? (
              <ButtonLink to="/projects" variant="secondary">
                进入项目列表
              </ButtonLink>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  )
}
