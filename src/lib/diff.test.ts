import { describe, expect, it } from 'vitest'
import { summarizeDiff } from './diff'
import { buildContentState, buildPost, buildProject, LATER_TIMESTAMP } from '../test/helpers'

describe('summarizeDiff', () => {
  it('识别新增的集合元素', () => {
    const current = buildContentState({ posts: [] })
    const incoming = buildContentState({ posts: [buildPost()] })

    const diff = summarizeDiff(current, incoming)
    const posts = diff.rows.find((row) => row.key === 'posts')

    expect(posts?.current).toBe(0)
    expect(posts?.incoming).toBe(1)
    expect(diff.hasChanges).toBe(true)
  })

  it('识别减少的集合元素', () => {
    const current = buildContentState({
      projects: [buildProject({ id: 'p1', slug: 'a' }), buildProject({ id: 'p2', slug: 'b' })],
    })
    const incoming = buildContentState({ projects: [] })

    const diff = summarizeDiff(current, incoming)
    const projects = diff.rows.find((row) => row.key === 'projects')

    expect(projects?.current).toBe(2)
    expect(projects?.incoming).toBe(0)
  })

  it('导入数据更新时间更旧时给出标记', () => {
    const current = buildContentState({ updatedAt: LATER_TIMESTAMP })
    const incoming = buildContentState({ updatedAt: '2025-01-01T00:00:00.000Z' })

    expect(summarizeDiff(current, incoming).isOlder).toBe(true)
  })

  it('导入数据更新时不标记为更旧', () => {
    const current = buildContentState({ updatedAt: '2025-01-01T00:00:00.000Z' })
    const incoming = buildContentState({ updatedAt: LATER_TIMESTAMP })

    expect(summarizeDiff(current, incoming).isOlder).toBe(false)
  })

  it('完全相同时 hasChanges 为 false', () => {
    const state = buildContentState()
    expect(summarizeDiff(state, state).hasChanges).toBe(false)
  })

  it('覆盖技能分类、技能、时间线、项目、文章五类集合', () => {
    const diff = summarizeDiff(buildContentState(), buildContentState())
    expect(diff.rows.map((row) => row.key)).toEqual([
      'skillCategories',
      'skills',
      'timeline',
      'projects',
      'posts',
    ])
  })
})
