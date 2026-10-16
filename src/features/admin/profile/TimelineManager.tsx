import { useMemo, useState } from 'react'
import { useContent } from '../../../content/useContent'
import { selectTimeline } from '../../../content/selectors'
import { formatYearMonthRange, formatTimestamp } from '../../../lib/date'
import { createId } from '../../../lib/id'
import type { TimelineItem } from '../../../lib/schema'
import { useConfirm } from '../../../hooks/confirm-context'
import { useToast } from '../../../hooks/toast-context'
import { Badge } from '../../../components/ui/Badge'
import { Button, IconButton } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { IconPencil, IconPlus, IconTrash } from '../../../components/icons'
import { TimelineItemForm, type TimelineDraft } from './TimelineItemForm'

/** 经历时间线管理（F-15）：新增、编辑、删除，删除前二次确认且可撤销 */
export function TimelineManager() {
  const { state, dispatch } = useContent()
  const confirm = useConfirm()
  const { pushToast } = useToast()

  const [editing, setEditing] = useState<{ item: TimelineItem | null } | null>(null)
  const items = useMemo(() => selectTimeline(state), [state])

  function handleSubmit(draft: TimelineDraft) {
    if (editing?.item === null || editing === null) {
      dispatch({
        type: 'addTimelineItem',
        item: { ...draft, id: createId(), order: state.timeline.length },
      })
      pushToast({ level: 'success', message: '已新增经历，前台时间线立即更新' })
    } else {
      dispatch({ type: 'updateTimelineItem', id: editing.item.id, patch: draft })
      pushToast({ level: 'success', message: '已保存修改' })
    }
    setEditing(null)
  }

  async function handleDelete(item: TimelineItem) {
    const confirmed = await confirm({
      title: `删除「${item.title}」这条经历？`,
      description: '删除后前台时间线会立即移除该条记录。删除后可在提示中点击「撤销」恢复。',
      confirmLabel: '删除该经历',
    })
    if (!confirmed) return

    dispatch({ type: 'removeTimelineItem', id: item.id })
    pushToast({
      level: 'success',
      message: `已删除「${item.title}」`,
      action: {
        label: '撤销',
        onClick: () => dispatch({ type: 'addTimelineItem', item }),
      },
    })
  }

  return (
    <div>
      <Card as="section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-parchment-100">经历时间线</h2>
            <p className="mt-1 text-xs leading-5 text-parchment-500">
              按开始时间倒序展示，结束时间留空的记录显示为「至今」。
            </p>
          </div>
          <Button onClick={() => setEditing({ item: null })}>
            <IconPlus />
            新增经历
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="还没有经历记录"
              description="新增第一条教育或实践经历，首页「教育与经历」区块会立即显示它。"
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-ink-700">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-start gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Badge tone={item.kind === 'education' ? 'accent' : 'neutral'}>
                      {item.kind === 'education' ? '教育' : '实践经历'}
                    </Badge>
                    <span className="text-xs text-parchment-500 tabular-nums">
                      {formatYearMonthRange(item.startDate, item.endDate)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-parchment-100">
                    {item.title}
                    {item.role.length > 0 ? (
                      <span className="ml-2 text-xs font-normal text-parchment-300">
                        {item.role}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-parchment-500">
                    {item.description}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <IconButton label={`编辑「${item.title}」`} onClick={() => setEditing({ item })}>
                    <IconPencil />
                  </IconButton>
                  <IconButton
                    label={`删除「${item.title}」`}
                    onClick={() => void handleDelete(item)}
                  >
                    <IconTrash />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="mt-4 text-xs text-parchment-500">
        最后修改时间：{formatTimestamp(state.profile.updatedAt)}
      </p>

      {editing !== null ? (
        <TimelineItemForm
          item={editing.item}
          onClose={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  )
}
