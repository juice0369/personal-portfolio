import { describe, expect, it } from 'vitest'
import { contentReducer } from './content-reducer'
import {
  buildContentState,
  buildPost,
  buildProject,
  buildSkill,
  buildSkillCategory,
  buildTimelineItem,
  FIXED_TIMESTAMP,
} from '../test/helpers'

describe('contentReducer 不可变性', () => {
  it('修改个人资料返回新对象，原状态不被改动', () => {
    const state = buildContentState()
    const next = contentReducer(state, { type: 'patchProfile', patch: { name: '新名字' } })

    expect(next).not.toBe(state)
    expect(next.profile.name).toBe('新名字')
    expect(state.profile.name).toBe('示例用户')
    expect(next.updatedAt).not.toBe(undefined)
  })

  it('修改站点设置只影响 settings', () => {
    const state = buildContentState()
    const next = contentReducer(state, {
      type: 'patchSettings',
      patch: { starfieldEnabled: false },
    })

    expect(next.settings.starfieldEnabled).toBe(false)
    expect(next.profile).toBe(state.profile)
  })
})

describe('contentReducer 技能与分类', () => {
  it('新增分类后 order 重排为连续的 0..n-1', () => {
    const state = buildContentState({ skillCategories: [], skills: [] })
    const afterFirst = contentReducer(state, {
      type: 'addSkillCategory',
      category: buildSkillCategory({ id: 'c1', name: '前端', order: 5 }),
    })
    const afterSecond = contentReducer(afterFirst, {
      type: 'addSkillCategory',
      category: buildSkillCategory({ id: 'c2', name: '后端', order: 9 }),
    })

    expect(afterSecond.skillCategories.map((category) => category.order)).toEqual([0, 1])
  })

  it('删除分类时同时删除该分类下的技能，避免出现悬空引用', () => {
    const state = buildContentState({
      skillCategories: [
        buildSkillCategory({ id: 'c1' }),
        buildSkillCategory({ id: 'c2', name: '后端', order: 1 }),
      ],
      skills: [
        buildSkill({ id: 's1', categoryId: 'c1', name: 'React' }),
        buildSkill({ id: 's2', categoryId: 'c2', name: 'Node', order: 1 }),
      ],
    })

    const next = contentReducer(state, { type: 'removeSkillCategory', id: 'c1' })

    expect(next.skillCategories.map((category) => category.id)).toEqual(['c2'])
    expect(next.skills.map((skill) => skill.id)).toEqual(['s2'])
    expect(next.skills[0]?.order).toBe(0)
  })

  it('修改技能的熟练度与顺序', () => {
    const state = buildContentState({ skills: [buildSkill({ id: 's1' })] })
    const next = contentReducer(state, {
      type: 'updateSkill',
      id: 's1',
      patch: { level: 5 },
    })

    expect(next.skills[0]?.level).toBe(5)
  })

  it('删除技能后原地移除', () => {
    const state = buildContentState({
      skills: [
        buildSkill({ id: 's1', name: 'React' }),
        buildSkill({ id: 's2', name: 'Vite', order: 1 }),
      ],
    })
    const next = contentReducer(state, { type: 'removeSkill', id: 's1' })

    expect(next.skills).toHaveLength(1)
    expect(next.skills[0]?.id).toBe('s2')
    expect(next.skills[0]?.order).toBe(0)
  })
})

describe('contentReducer 时间线', () => {
  it('新增、修改、删除经历', () => {
    const base = buildContentState({ timeline: [] })
    const added = contentReducer(base, {
      type: 'addTimelineItem',
      item: buildTimelineItem({ id: 't1' }),
    })
    expect(added.timeline).toHaveLength(1)

    const updated = contentReducer(added, {
      type: 'updateTimelineItem',
      id: 't1',
      patch: { title: '新机构' },
    })
    expect(updated.timeline[0]?.title).toBe('新机构')

    const removed = contentReducer(updated, { type: 'removeTimelineItem', id: 't1' })
    expect(removed.timeline).toHaveLength(0)
  })
})

describe('contentReducer 项目', () => {
  it('新增项目后按 order 排序并重排为连续值', () => {
    const base = buildContentState({ projects: [] })
    const first = contentReducer(base, {
      type: 'addProject',
      project: buildProject({ id: 'p1', slug: 'a', order: 3 }),
    })
    const second = contentReducer(first, {
      type: 'addProject',
      project: buildProject({ id: 'p2', slug: 'b', title: '第二个', order: 7 }),
    })

    expect(second.projects.map((project) => project.id)).toEqual(['p1', 'p2'])
    expect(second.projects.map((project) => project.order)).toEqual([0, 1])
  })

  it('修改项目时刷新 updatedAt', () => {
    const state = buildContentState({
      projects: [buildProject({ id: 'p1', updatedAt: FIXED_TIMESTAMP })],
    })
    const next = contentReducer(state, {
      type: 'updateProject',
      id: 'p1',
      patch: { title: '改过的标题' },
    })

    expect(next.projects[0]?.title).toBe('改过的标题')
    expect(next.projects[0]?.updatedAt).not.toBe(FIXED_TIMESTAMP)
  })

  it('删除项目后该项目从集合中消失', () => {
    const state = buildContentState({
      projects: [
        buildProject({ id: 'p1', slug: 'a' }),
        buildProject({ id: 'p2', slug: 'b', order: 1 }),
      ],
    })
    const next = contentReducer(state, { type: 'removeProject', id: 'p1' })

    expect(next.projects.map((project) => project.slug)).toEqual(['b'])
  })
})

describe('contentReducer 文章', () => {
  it('新增草稿文章不改变 status', () => {
    const base = buildContentState({ posts: [] })
    const next = contentReducer(base, {
      type: 'addPost',
      post: buildPost({ id: 'p1', status: 'draft', content: '' }),
    })

    expect(next.posts).toHaveLength(1)
    expect(next.posts[0]?.status).toBe('draft')
  })

  it('修改文章时刷新 updatedAt，发布时间保持不变', () => {
    const state = buildContentState({
      posts: [buildPost({ id: 'p1', publishedAt: '2026-01-01', updatedAt: FIXED_TIMESTAMP })],
    })
    const next = contentReducer(state, {
      type: 'updatePost',
      id: 'p1',
      patch: { status: 'published', content: '新正文' },
    })

    expect(next.posts[0]?.publishedAt).toBe('2026-01-01')
    expect(next.posts[0]?.updatedAt).not.toBe(FIXED_TIMESTAMP)
  })

  it('删除文章后集合中不再包含它', () => {
    const state = buildContentState({
      posts: [buildPost({ id: 'p1', slug: 'a' }), buildPost({ id: 'p2', slug: 'b' })],
    })
    const next = contentReducer(state, { type: 'removePost', id: 'p1' })

    expect(next.posts.map((post) => post.id)).toEqual(['p2'])
  })
})

describe('contentReducer replaceAll', () => {
  it('只保留 schema 允许的集合，不展开已有状态', () => {
    const current = buildContentState()
    const incoming = {
      ...buildContentState(),
      settings: { ...buildContentState().settings, siteTitle: '导入的标题' },
    }

    const next = contentReducer(current, { type: 'replaceAll', state: incoming })

    expect(Object.keys(next).sort()).toEqual([
      'posts',
      'profile',
      'projects',
      'settings',
      'skillCategories',
      'skills',
      'timeline',
      'updatedAt',
      'version',
    ])
    expect(next.settings.siteTitle).toBe('导入的标题')
  })

  it('写入时刷新 updatedAt', () => {
    const incoming = buildContentState({ updatedAt: FIXED_TIMESTAMP })
    const next = contentReducer(buildContentState(), { type: 'replaceAll', state: incoming })

    expect(next.updatedAt).not.toBe(FIXED_TIMESTAMP)
  })
})
