import { useMemo, useState } from 'react'
import { useContent } from '../../../content/useContent'
import { selectSkillGroups } from '../../../content/selectors'
import { compareByOrder } from '../../../lib/date'
import { createId } from '../../../lib/id'
import type { Skill } from '../../../lib/schema'
import { useConfirm } from '../../../hooks/confirm-context'
import { useToast } from '../../../hooks/toast-context'
import { Badge } from '../../../components/ui/Badge'
import { Button, IconButton } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import {
  IconArrowDown,
  IconArrowUp,
  IconPencil,
  IconPlus,
  IconTrash,
} from '../../../components/icons'
import { SkillFormDialog, type SkillDraft } from './SkillFormDialog'

/** 熟练度的 5 格可视化（与前台一致，纯装饰，文字已给出数值） */
function LevelBar({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          className={[
            'h-1.5 w-4 rounded-full',
            step <= level ? 'bg-champagne-400' : 'bg-ink-600',
          ].join(' ')}
        />
      ))}
    </span>
  )
}

/** 技能管理（F-16）：新增、修改、删除、调整顺序与熟练度 */
export function SkillPanel() {
  const { state, dispatch } = useContent()
  const { pushToast } = useToast()
  const confirm = useConfirm()

  const [editing, setEditing] = useState<{ skill: Skill | null } | null>(null)

  const groups = useMemo(() => selectSkillGroups(state), [state])
  const categories = useMemo(
    () => [...state.skillCategories].sort(compareByOrder),
    [state.skillCategories],
  )

  function handleSubmit(draft: SkillDraft) {
    if (editing === null) return

    if (editing.skill === null) {
      dispatch({
        type: 'addSkill',
        skill: { ...draft, id: createId(), order: state.skills.length },
      })
      pushToast({ level: 'success', message: `已新增技能「${draft.name}」` })
    } else {
      dispatch({ type: 'updateSkill', id: editing.skill.id, patch: draft })
      pushToast({ level: 'success', message: '已保存技能修改' })
    }
    setEditing(null)
  }

  async function handleDelete(skill: Skill) {
    const confirmed = await confirm({
      title: `删除技能「${skill.name}」？`,
      description: '删除后前台技能区块会立即移除该技能。删除后可在提示中点击「撤销」恢复。',
      confirmLabel: `删除「${skill.name}」`,
    })
    if (!confirmed) return

    dispatch({ type: 'removeSkill', id: skill.id })
    pushToast({
      level: 'success',
      message: `已删除「${skill.name}」，可撤销`,
      action: { label: '撤销', onClick: () => dispatch({ type: 'addSkill', skill }) },
    })
  }

  /** 在同一分类内与相邻技能交换顺序；reducer 会把 order 重排为连续值 */
  function move(skill: Skill, direction: -1 | 1) {
    const group = groups.find((item) => item.category.id === skill.categoryId)
    if (!group) return
    const index = group.skills.findIndex((item) => item.id === skill.id)
    const target = group.skills[index + direction]
    if (!target) return

    dispatch({ type: 'updateSkill', id: skill.id, patch: { order: target.order } })
    dispatch({ type: 'updateSkill', id: target.id, patch: { order: skill.order } })
    pushToast({ level: 'info', message: '已调整顺序，前台技能展示同步更新' })
  }

  return (
    <Card as="section">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-parchment-100">技能列表</h2>
          <p className="mt-1 text-xs leading-5 text-parchment-500">
            顺序决定前台同一分类内的展示顺序。技能名称不可重复，最多 30 个字符。
          </p>
        </div>
        <Button
          disabled={categories.length === 0}
          title={categories.length === 0 ? '请先新增一个技能分类' : undefined}
          onClick={() => setEditing({ skill: null })}
        >
          <IconPlus />
          新增技能
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-parchment-300">
          还没有技能分类，先在上方新增分类，才能添加技能。
        </p>
      ) : null}

      {groups.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="还没有技能"
            description="点击「新增技能」添加第一项，首页「技能」区块会立即显示。"
          />
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {groups.map((group) => (
            <div key={group.category.id}>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-parchment-100">{group.category.name}</h3>
                <Badge tone="muted">{group.skills.length} 项</Badge>
              </div>

              <ul className="mt-2 divide-y divide-ink-700">
                {group.skills.map((skill, index) => (
                  <li key={skill.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-parchment-100">
                        {skill.name}
                      </span>
                      {skill.description.length > 0 ? (
                        <span className="mt-0.5 block truncate text-xs text-parchment-500">
                          {skill.description}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-2">
                      <LevelBar level={skill.level} />
                      <span className="text-xs text-parchment-500 tabular-nums">
                        {skill.level}/5
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <IconButton
                        label={`上移「${skill.name}」`}
                        disabled={index === 0}
                        onClick={() => move(skill, -1)}
                      >
                        <IconArrowUp />
                      </IconButton>
                      <IconButton
                        label={`下移「${skill.name}」`}
                        disabled={index === group.skills.length - 1}
                        onClick={() => move(skill, 1)}
                      >
                        <IconArrowDown />
                      </IconButton>
                      <IconButton
                        label={`编辑「${skill.name}」`}
                        onClick={() => setEditing({ skill })}
                      >
                        <IconPencil />
                      </IconButton>
                      <IconButton
                        label={`删除「${skill.name}」`}
                        onClick={() => void handleDelete(skill)}
                      >
                        <IconTrash />
                      </IconButton>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {editing !== null ? (
        <SkillFormDialog
          skill={editing.skill}
          categories={categories}
          defaultCategoryId={editing.skill?.categoryId ?? categories[0]?.id ?? ''}
          takenNames={state.skills
            .filter((skill) => skill.id !== editing.skill?.id)
            .map((skill) => skill.name)}
          onClose={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </Card>
  )
}
