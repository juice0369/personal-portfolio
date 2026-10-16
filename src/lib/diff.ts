import type { ContentState } from './schema'

/** 导入前的差异摘要：各集合数量变化与更新时间对比 */

export type DiffRow = {
  key: string
  label: string
  current: number
  incoming: number
}

export type DiffSummary = {
  rows: DiffRow[]
  currentUpdatedAt: string
  incomingUpdatedAt: string
  /** 导入数据的更新时间早于当前数据 */
  isOlder: boolean
  hasChanges: boolean
}

export function summarizeDiff(current: ContentState, incoming: ContentState): DiffSummary {
  const rows: DiffRow[] = [
    {
      key: 'skillCategories',
      label: '技能分类',
      current: current.skillCategories.length,
      incoming: incoming.skillCategories.length,
    },
    {
      key: 'skills',
      label: '技能',
      current: current.skills.length,
      incoming: incoming.skills.length,
    },
    {
      key: 'timeline',
      label: '经历时间线',
      current: current.timeline.length,
      incoming: incoming.timeline.length,
    },
    {
      key: 'projects',
      label: '项目',
      current: current.projects.length,
      incoming: incoming.projects.length,
    },
    {
      key: 'posts',
      label: '文章',
      current: current.posts.length,
      incoming: incoming.posts.length,
    },
  ]

  const currentTime = Date.parse(current.updatedAt)
  const incomingTime = Date.parse(incoming.updatedAt)

  return {
    rows,
    currentUpdatedAt: current.updatedAt,
    incomingUpdatedAt: incoming.updatedAt,
    isOlder:
      Number.isFinite(currentTime) && Number.isFinite(incomingTime)
        ? incomingTime < currentTime
        : false,
    hasChanges: rows.some((row) => row.current !== row.incoming),
  }
}
