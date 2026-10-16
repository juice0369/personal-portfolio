import { describe, expect, it } from 'vitest'
import { CONTENT_STATE_VERSION } from '../constants'
import { contentStateSchema, findDuplicateIndexes } from './content-state'
import {
  buildContentState,
  buildPost,
  buildProfile,
  buildProject,
  buildSkill,
  buildSkillCategory,
  buildTimelineItem,
} from '../../test/helpers'

/** 取某个字段路径上的第一条错误消息 */
function messagesAtPath(state: unknown, path: readonly (string | number)[]): string[] {
  const result = contentStateSchema.safeParse(state)
  if (result.success) return []
  const key = path.map((segment) => String(segment)).join('.')
  return result.error.issues
    .filter((issue) => issue.path.map((segment) => String(segment)).join('.') === key)
    .map((issue) => issue.message)
}

describe('contentStateSchema 字段约束', () => {
  it('接受一份完整合法的内置数据结构', () => {
    expect(contentStateSchema.safeParse(buildContentState()).success).toBe(true)
  })

  it('版本号与常量不一致时拒绝', () => {
    const state = { ...buildContentState(), version: CONTENT_STATE_VERSION + 1 }
    expect(contentStateSchema.safeParse(state).success).toBe(false)
  })

  it('超长的项目标题给出带字段名与上限的提示', () => {
    const state = buildContentState({
      projects: [buildProject({ title: '标'.repeat(61) })],
    })
    expect(messagesAtPath(state, ['projects', 0, 'title'])).toContain('项目标题不能超过 60 个字符')
  })

  it('空白的姓名被拒绝', () => {
    const state = buildContentState({ profile: buildProfile({ name: '   ' }) })
    expect(messagesAtPath(state, ['profile', 'name'])).toContain('姓名不能为空')
  })

  it('邮箱格式不正确时拒绝', () => {
    const state = buildContentState({ profile: buildProfile({ email: 'abc' }) })
    expect(messagesAtPath(state, ['profile', 'email'])).toContain('邮箱格式不正确')
  })

  it('结束时间早于开始时间的项目被拒绝', () => {
    const state = buildContentState({
      projects: [buildProject({ startDate: '2025-06', endDate: '2025-03' })],
    })
    expect(messagesAtPath(state, ['projects', 0, 'endDate'])).toContain('结束时间不能早于开始时间')
  })

  it('已发布但正文为空白字符的文章被拒绝', () => {
    const state = buildContentState({ posts: [buildPost({ status: 'published', content: '   ' })] })
    expect(messagesAtPath(state, ['posts', 0, 'content'])).toContain('发布状态的文章正文不能为空')
  })

  it('草稿允许正文为空', () => {
    const state = buildContentState({ posts: [buildPost({ status: 'draft', content: '' })] })
    expect(contentStateSchema.safeParse(state).success).toBe(true)
  })

  it('经历描述允许留空，前台不渲染该段', () => {
    const state = buildContentState({ timeline: [buildTimelineItem({ description: '' })] })
    expect(contentStateSchema.safeParse(state).success).toBe(true)
  })

  it('留空的经历描述仍然受 400 字符上限约束', () => {
    const state = buildContentState({
      timeline: [buildTimelineItem({ description: '描'.repeat(401) })],
    })
    expect(messagesAtPath(state, ['timeline', 0, 'description'])).toContain(
      '经历描述不能超过 400 个字符',
    )
  })

  it('熟练度超出 1–5 范围时拒绝', () => {
    const state = buildContentState({ skills: [buildSkill({ level: 6 })] })
    expect(messagesAtPath(state, ['skills', 0, 'level'])).toContain('熟练度最高为 5')
  })
})

describe('contentStateSchema 跨集合引用校验', () => {
  it('技能引用了不存在的分类时报错，且路径指向具体技能', () => {
    const state = buildContentState({
      skillCategories: [buildSkillCategory({ id: 'cat-frontend' })],
      skills: [
        buildSkill({ id: 'skill-1', name: 'React', categoryId: 'cat-frontend' }),
        buildSkill({ id: 'skill-2', name: 'Vite', categoryId: 'cat-missing' }),
      ],
    })

    expect(messagesAtPath(state, ['skills', 1, 'categoryId'])).toContain(
      '该技能引用的技能分类不存在',
    )
    expect(messagesAtPath(state, ['skills', 0, 'categoryId'])).toHaveLength(0)
  })

  it('未选择分类（空字符串）时给出提示', () => {
    const state = buildContentState({ skills: [buildSkill({ categoryId: '' })] })
    expect(messagesAtPath(state, ['skills', 0, 'categoryId'])).toContain('请选择技能分类')
  })
})

describe('contentStateSchema 唯一性校验', () => {
  it('项目 slug 重复时报错并标记两处', () => {
    const state = buildContentState({
      projects: [
        buildProject({ id: 'p1', slug: 'same', title: '第一个' }),
        buildProject({ id: 'p2', slug: 'same', title: '第二个' }),
      ],
    })

    expect(messagesAtPath(state, ['projects', 0, 'slug'])).toContain('项目标识不能重复')
    expect(messagesAtPath(state, ['projects', 1, 'slug'])).toContain('项目标识不能重复')
  })

  it('技能名称重复时报错', () => {
    const state = buildContentState({
      skills: [buildSkill({ id: 's1', name: 'React' }), buildSkill({ id: 's2', name: 'React' })],
    })
    expect(messagesAtPath(state, ['skills', 1, 'name'])).toContain('技能名称不能重复')
  })

  it('文章 id 重复时报错', () => {
    const state = buildContentState({
      posts: [buildPost({ id: 'same', slug: 'a' }), buildPost({ id: 'same', slug: 'b' })],
    })
    expect(messagesAtPath(state, ['posts', 1, 'id'])).toContain('文章 id 不能重复')
  })

  it('经历 id 重复时报错', () => {
    const state = buildContentState({
      timeline: [buildTimelineItem({ id: 'same' }), buildTimelineItem({ id: 'same', order: 1 })],
    })
    expect(messagesAtPath(state, ['timeline', 1, 'id'])).toContain('经历 id 不能重复')
  })
})

describe('contentStateSchema 安全相关校验', () => {
  it('社交链接使用 javascript: 伪协议时被拒绝', () => {
    const state = buildContentState({
      profile: buildProfile({
        socials: [{ id: 's1', label: '点我', url: 'javascript:alert(1)', icon: 'link' }],
      }),
    })
    expect(messagesAtPath(state, ['profile', 'socials', 0, 'url'])).toContain(
      '仅支持 http 或 https 链接',
    )
  })

  it('项目外链使用 ftp: 时被拒绝', () => {
    const state = buildContentState({
      projects: [buildProject({ demoUrl: 'ftp://example.com' })],
    })
    expect(messagesAtPath(state, ['projects', 0, 'demoUrl'])).toContain('仅支持 http 或 https 链接')
  })

  it('未知字段被剥离，不会进入校验结果', () => {
    const raw = {
      ...buildContentState(),
      injected: 'x',
      profile: { ...buildProfile(), injected: 'x' },
    }

    const result = contentStateSchema.parse(raw)
    expect(Object.keys(result)).not.toContain('injected')
    expect(Object.keys(result.profile)).not.toContain('injected')
  })

  it('JSON 中的 __proto__ 键不会污染原型', () => {
    const validJson = JSON.stringify(buildContentState())
    const raw = JSON.parse(validJson.replace(/^\{/, '{"__proto__": {"polluted": true},')) as unknown

    const result = contentStateSchema.parse(raw)
    expect(Object.keys(result)).not.toContain('__proto__')
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })
})

describe('findDuplicateIndexes', () => {
  it('标记首次出现与后续重复项', () => {
    expect(findDuplicateIndexes(['a', 'b', 'a', 'c', 'b'])).toEqual([0, 1, 2, 4])
  })

  it('无重复时返回空数组', () => {
    expect(findDuplicateIndexes(['a', 'b'])).toEqual([])
  })
})
