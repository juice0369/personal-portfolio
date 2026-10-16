import { useMemo, useState } from 'react'
import { useContent } from '../../../content/useContent'
import { compareByOrder } from '../../../lib/date'
import { createId } from '../../../lib/id'
import type { SkillCategory } from '../../../lib/schema'
import { useConfirm } from '../../../hooks/confirm-context'
import { useToast } from '../../../hooks/toast-context'
import { Badge } from '../../../components/ui/Badge'
import { Button, IconButton } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { IconPencil, IconPlus, IconTrash } from '../../../components/icons'
import { CategoryFormDialog } from './CategoryFormDialog'

/** 技能分类管理（F-16）：新增、重命名、删除；删除分类会连同其下技能一起删除并说明后果 */
export function CategoryPanel() {
  const { state, dispatch } = useContent()
  const { pushToast } = useToast()
  const confirm = useConfirm()

  const [editing, setEditing] = useState<{ category: SkillCategory | null } | null>(null)

  const categories = useMemo(
    () => [...state.skillCategories].sort(compareByOrder),
    [state.skillCategories],
  )

  const countOf = (categoryId: string) =>
    state.skills.filter((skill) => skill.categoryId === categoryId).length

  function handleSubmit(name: string) {
    if (editing === null) return

    if (editing.category === null) {
      dispatch({
        type: 'addSkillCategory',
        category: { id: createId(), name, order: state.skillCategories.length },
      })
      pushToast({ level: 'success', message: `已新增分类「${name}」` })
    } else {
      dispatch({ type: 'updateSkillCategory', id: editing.category.id, patch: { name } })
      pushToast({ level: 'success', message: '已重命名分类，前台分组名称已同步' })
    }
    setEditing(null)
  }

  async function handleDelete(category: SkillCategory) {
    const count = countOf(category.id)
    const confirmed = await confirm({
      title: `删除分类「${category.name}」？`,
      description:
        count === 0
          ? '该分类下没有技能，删除后前台不再显示这个分组。删除后可在提示中点击「撤销」恢复。'
          : `该分类下的 ${count} 项技能会一并删除，前台会立即消失。删除后可在提示中点击「撤销」恢复分类与这些技能。`,
      confirmLabel: count === 0 ? '删除该分类' : `删除分类与 ${count} 项技能`,
    })
    if (!confirmed) return

    const removedSkills = state.skills.filter((skill) => skill.categoryId === category.id)
    dispatch({ type: 'removeSkillCategory', id: category.id })
    pushToast({
      level: 'success',
      message: `已删除分类「${category.name}」${count === 0 ? '' : `及其下 ${count} 项技能`}`,
      action: {
        label: '撤销',
        onClick: () => {
          dispatch({ type: 'addSkillCategory', category })
          removedSkills.forEach((skill) => dispatch({ type: 'addSkill', skill }))
        },
      },
    })
  }

  return (
    <Card as="section">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-parchment-100">技能分类</h2>
          <p className="mt-1 text-xs leading-5 text-parchment-500">
            分类决定首页技能区块的分组与顺序，没有技能的分类不会在前台显示。
          </p>
        </div>
        <Button onClick={() => setEditing({ category: null })}>
          <IconPlus />
          新增分类
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="还没有技能分类"
            description="先新增一个分类（例如「前端」），再到下方技能列表中添加技能。"
          />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-ink-700">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="min-w-0 flex-1 truncate text-sm text-parchment-100">
                {category.name}
              </span>
              <Badge tone="muted">{countOf(category.id)} 项技能</Badge>
              <span className="flex shrink-0 items-center gap-1">
                <IconButton
                  label={`重命名分类「${category.name}」`}
                  onClick={() => setEditing({ category })}
                >
                  <IconPencil />
                </IconButton>
                <IconButton
                  label={`删除分类「${category.name}」`}
                  onClick={() => void handleDelete(category)}
                >
                  <IconTrash />
                </IconButton>
              </span>
            </li>
          ))}
        </ul>
      )}

      {editing !== null ? (
        <CategoryFormDialog
          category={editing.category}
          takenNames={state.skillCategories
            .filter((category) => category.id !== editing.category?.id)
            .map((category) => category.name)}
          onClose={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </Card>
  )
}
