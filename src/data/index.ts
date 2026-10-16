import { CONTENT_STATE_VERSION } from '../lib/constants'
import { parseFrontmatter } from '../lib/markdown/frontmatter'
import { contentStateSchema, postSchema, type ContentState, type Post } from '../lib/schema'
import { profile } from './profile'
import { projects } from './projects'
import { settings } from './settings'
import { skillCategories, skills } from './skills'
import { timeline } from './timeline'

/**
 * 内置默认数据（第一层数据来源）。
 *
 * 文章以 Markdown + frontmatter 存放，通过 import.meta.glob 以原始文本载入并解析。
 * frontmatter 无法提供 updatedAt，因此统一取发布日期的当天零点，
 * 避免因构建时间不同导致数据抖动（TECH_DESIGN §4.4）。
 */

const postModules = import.meta.glob('./posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** '2026-03-12' → '2026-03-12T00:00:00.000Z' */
export function isoDayStart(isoDay: string): string {
  return `${isoDay}T00:00:00.000Z`
}

export function parseSeedPost(path: string, raw: string): Post {
  const { data, content } = parseFrontmatter(raw)
  const fileName = path.split('/').pop()?.replace(/\.md$/u, '') ?? ''
  const publishedAt = typeof data.publishedAt === 'string' ? data.publishedAt : '2026-01-01'

  return postSchema.parse({
    id: fileName,
    slug: typeof data.slug === 'string' ? data.slug : fileName,
    title: data.title,
    summary: data.summary,
    tags: Array.isArray(data.tags) ? data.tags : [],
    publishedAt,
    updatedAt: isoDayStart(publishedAt),
    status: data.status,
    content,
  })
}

export const seedPosts: Post[] = Object.entries(postModules).map(([path, raw]) =>
  parseSeedPost(path, raw),
)

/** 内置默认数据整体；加载时通过 schema 完整校验一次，字段写错会立即暴露 */
export const seedContent: ContentState = contentStateSchema.parse({
  version: CONTENT_STATE_VERSION,
  updatedAt: '2026-10-16T00:00:00.000Z',
  profile,
  skillCategories,
  skills,
  timeline,
  projects,
  posts: seedPosts,
  settings,
})
