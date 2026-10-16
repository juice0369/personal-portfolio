import { describe, expect, it } from 'vitest'
import { seedContent } from './index'

/**
 * 内置默认数据的回归测试。
 *
 * `src/data/index.ts` 在导入时用 `contentStateSchema.parse` 校验一次，
 * 因此这里能覆盖"默认数据被改坏"的情况：字段越界、跨集合引用失效、顺序出现空洞等。
 * 断言只针对结构约束（不锁死具体文案），改动默认内容时无需同步修改用例。
 */

/** order 必须是从 0 开始的连续整数（AGENTS.md §10：写入后重排，避免空洞与重复） */
function expectDenseOrder(values: { order: number }[]) {
  expect(
    values
      .map((value) => value.order)
      .slice()
      .sort((a, b) => a - b),
  ).toEqual(values.map((_, index) => index))
}

describe('内置默认数据', () => {
  it('个人资料齐备：姓名、职业方向、简介与至少一个联系方式', () => {
    const { profile } = seedContent

    expect(profile.name.trim()).not.toBe('')
    expect(profile.headline.trim()).not.toBe('')
    expect(profile.bio.trim()).not.toBe('')
    expect(profile.email.trim()).not.toBe('')
  })

  it('简介按空行分段，前台 Hero 能拆成多段渲染', () => {
    const paragraphs = seedContent.profile.bio
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)

    expect(paragraphs.length).toBeGreaterThan(0)
  })

  it('技能分类与技能一一对应：不存在没有技能的分类，也不存在悬空的 categoryId', () => {
    const categoryIds = new Set(seedContent.skillCategories.map((category) => category.id))

    expect(seedContent.skillCategories.length).toBeGreaterThan(0)
    seedContent.skills.forEach((skill) => {
      expect(categoryIds.has(skill.categoryId)).toBe(true)
    })
    seedContent.skillCategories.forEach((category) => {
      expect(seedContent.skills.some((skill) => skill.categoryId === category.id)).toBe(true)
    })
  })

  it('分类内技能的顺序连续，分类本身的顺序也连续', () => {
    expectDenseOrder(seedContent.skillCategories)
    seedContent.skillCategories.forEach((category) => {
      expectDenseOrder(seedContent.skills.filter((skill) => skill.categoryId === category.id))
    })
  })

  it('时间线与项目的顺序连续', () => {
    expectDenseOrder(seedContent.timeline)
    expectDenseOrder(seedContent.projects)
  })

  it('首页精选项目不超过 3 个（PRD F-04 的上限）', () => {
    const featured = seedContent.projects.filter((project) => project.featured)

    expect(featured.length).toBeGreaterThan(0)
    expect(featured.length).toBeLessThanOrEqual(3)
  })

  it('至少有一篇已发布文章，博客列表不会落到空态', () => {
    const published = seedContent.posts.filter((post) => post.status === 'published')

    expect(published.length).toBeGreaterThan(0)
  })

  it('站点设置的每页条数为正整数，标签页标题非空', () => {
    expect(seedContent.settings.siteTitle.trim()).not.toBe('')
    expect(Number.isInteger(seedContent.settings.postsPerPage)).toBe(true)
    expect(seedContent.settings.postsPerPage).toBeGreaterThan(0)
  })
})
