import { useMemo, useState } from 'react'
import { useContent } from '../../content/useContent'
import { selectProjectCategories, selectProjects } from '../../content/selectors'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ButtonLink } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/PageHeader'
import { ProjectCard } from './ProjectCard'

/** 项目列表页（F-05 / AC-F05）：展示全部项目，支持按分类筛选 */
export function ProjectListPage() {
  const { state } = useContent()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  useDocumentTitle('项目')

  const projects = useMemo(() => selectProjects(state), [state])
  const categories = useMemo(() => selectProjectCategories(state), [state])

  const visible =
    activeCategory === null
      ? projects
      : projects.filter((project) => project.category.trim() === activeCategory)

  // 分类被删除后不再显示对应的筛选按钮，同时也清掉失效的选中态
  const effectiveCategory =
    activeCategory !== null && categories.includes(activeCategory) ? activeCategory : null

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        title="项目"
        description="按时间倒序记录做过的项目，包含背景、技术方案与成果要点。"
      />

      {projects.length === 0 ? (
        <EmptyState
          title="还没有项目"
          description="在后台「项目」页面新增第一个项目，或从数据备份中导入内容。"
          action={
            <ButtonLink to="/" variant="secondary">
              返回首页
            </ButtonLink>
          }
        />
      ) : (
        <>
          {categories.length > 1 ? (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-parchment-500">按分类筛选：</span>
              <button
                type="button"
                aria-pressed={effectiveCategory === null}
                onClick={() => setActiveCategory(null)}
                className={[
                  'inline-flex min-h-11 items-center rounded-control border px-3 text-sm focus-visible:focus-ring',
                  effectiveCategory === null
                    ? 'border-champagne-400 text-champagne-400'
                    : 'border-ink-600 text-parchment-300 hover:text-parchment-100',
                ].join(' ')}
              >
                全部（{projects.length}）
              </button>
              {categories.map((category) => {
                const count = projects.filter(
                  (project) => project.category.trim() === category,
                ).length
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={effectiveCategory === category}
                    onClick={() => setActiveCategory(category)}
                    className={[
                      'inline-flex min-h-11 items-center rounded-control border px-3 text-sm focus-visible:focus-ring',
                      effectiveCategory === category
                        ? 'border-champagne-400 text-champagne-400'
                        : 'border-ink-600 text-parchment-300 hover:text-parchment-100',
                    ].join(' ')}
                  >
                    {category}（{count}）
                  </button>
                )
              })}
            </div>
          ) : null}

          {visible.length === 0 ? (
            <EmptyState
              title="该分类下暂时没有项目"
              description="换一个分类查看，或点击「全部」回到完整列表。"
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {visible.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
