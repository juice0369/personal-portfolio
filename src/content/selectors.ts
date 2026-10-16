import { compareByOrder, compareByPublishedAtDesc, compareTimelineDesc } from '../lib/date'
import type { ContentState, Post, Project, Skill, SkillCategory, TimelineItem } from '../lib/schema'

/**
 * 派生数据：列表的排序、过滤与统计集中在这里，避免各页面各写一套。
 * 全部为纯函数，可直接单测；页面中用 useMemo 包裹后调用。
 */

/** 已发布文章，按发布日期倒序 */
export function selectPublishedPosts(state: ContentState): Post[] {
  return state.posts.filter((post) => post.status === 'published').sort(compareByPublishedAtDesc)
}

/** 草稿文章，按最后修改时间倒序 */
export function selectDraftPosts(state: ContentState): Post[] {
  return state.posts
    .filter((post) => post.status === 'draft')
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

/** 首页精选项目，按 order 排序，最多 limit 个（PRD F-04） */
export function selectFeaturedProjects(state: ContentState, limit = 3): Project[] {
  return state.projects
    .filter((project) => project.featured)
    .sort(compareByOrder)
    .slice(0, limit)
}

/** 全部项目，按 order 排序 */
export function selectProjects(state: ContentState): Project[] {
  return [...state.projects].sort(compareByOrder)
}

/** 项目分类清单（去重，保持项目顺序） */
export function selectProjectCategories(state: ContentState): string[] {
  const categories: string[] = []
  for (const project of selectProjects(state)) {
    const category = project.category?.trim()
    if (category && !categories.includes(category)) categories.push(category)
  }
  return categories
}

export function selectProjectBySlug(state: ContentState, slug: string): Project | undefined {
  return state.projects.find((project) => project.slug === slug)
}

export function selectPostBySlug(state: ContentState, slug: string): Post | undefined {
  return state.posts.find((post) => post.slug === slug)
}

/** 时间线：开始时间倒序，相同则按 order 升序（F-03） */
export function selectTimeline(state: ContentState): TimelineItem[] {
  return [...state.timeline].sort(compareTimelineDesc)
}

export type SkillGroup = {
  category: SkillCategory
  skills: Skill[]
}

/** 按分类分组技能；不包含没有任何技能的分类，避免出现空标题（AC-F02） */
export function selectSkillGroups(state: ContentState): SkillGroup[] {
  return [...state.skillCategories]
    .sort(compareByOrder)
    .map((category) => ({
      category,
      skills: state.skills.filter((skill) => skill.categoryId === category.id).sort(compareByOrder),
    }))
    .filter((group) => group.skills.length > 0)
}

/** 全部标签（去重，按出现频次倒序） */
export function selectPostTags(state: ContentState): string[] {
  const counts = new Map<string, number>()
  for (const post of selectPublishedPosts(state)) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag)
}

export type ContentStats = {
  skills: number
  skillCategories: number
  timeline: number
  projects: number
  posts: number
  publishedPosts: number
  draftPosts: number
}

export function selectStats(state: ContentState): ContentStats {
  const draftPosts = state.posts.filter((post) => post.status === 'draft').length
  return {
    skills: state.skills.length,
    skillCategories: state.skillCategories.length,
    timeline: state.timeline.length,
    projects: state.projects.length,
    posts: state.posts.length,
    publishedPosts: state.posts.length - draftPosts,
    draftPosts,
  }
}

/** 最近修改的项目（按 updatedAt 倒序） */
export function selectRecentProjects(state: ContentState, limit = 3): Project[] {
  return [...state.projects].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, limit)
}

/** 最近的草稿文章（按 updatedAt 倒序） */
export function selectRecentDrafts(state: ContentState, limit = 5): Post[] {
  return selectDraftPosts(state).slice(0, limit)
}

/** 博客列表用的分页切片 */
export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = Math.max(0, (page - 1) * perPage)
  return items.slice(start, start + perPage)
}

export function totalPages(total: number, perPage: number): number {
  if (perPage <= 0) return 1
  return Math.max(1, Math.ceil(total / perPage))
}

/** 详情页的上一篇 / 下一篇（列表为发布日期倒序，因此"上一篇"是更新的文章） */
export function selectAdjacentPosts(
  state: ContentState,
  slug: string,
): { previous: Post | null; next: Post | null } {
  const posts = selectPublishedPosts(state)
  const index = posts.findIndex((post) => post.slug === slug)
  if (index === -1) return { previous: null, next: null }
  return {
    previous: posts[index - 1] ?? null,
    next: posts[index + 1] ?? null,
  }
}
