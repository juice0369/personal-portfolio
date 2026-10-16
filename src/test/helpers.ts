import { CONTENT_STATE_VERSION } from '../lib/constants'
import {
  contentStateSchema,
  type ContentState,
  type Post,
  type Profile,
  type Project,
  type SiteSettings,
  type Skill,
  type SkillCategory,
  type TimelineItem,
} from '../lib/schema'

/**
 * 测试数据工厂。
 *
 * 全部使用虚构内容（AGENTS.md §6.2），并且一律通过各自 schema 校验，
 * 这样工厂本身写错字段时用例会立刻失败，而不是给出难以定位的断言错误。
 * 时间统一注入固定值，禁止依赖真实当前时间（AGENTS.md §5.3）。
 */

export const FIXED_TIMESTAMP = '2026-01-01T00:00:00.000Z'
export const LATER_TIMESTAMP = '2026-06-01T00:00:00.000Z'

export function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    name: '示例用户',
    headline: '前端开发工程师',
    bio: '这是一段用于测试的个人简介。',
    avatarAssetId: null,
    email: 'tester@example.com',
    phone: '',
    location: '杭州',
    socials: [],
    updatedAt: FIXED_TIMESTAMP,
    ...overrides,
  }
}

export function buildSkillCategory(overrides: Partial<SkillCategory> = {}): SkillCategory {
  return { id: 'cat-frontend', name: '前端', order: 0, ...overrides }
}

export function buildSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: 'skill-react',
    categoryId: 'cat-frontend',
    name: 'React',
    level: 4,
    description: '',
    order: 0,
    ...overrides,
  }
}

export function buildTimelineItem(overrides: Partial<TimelineItem> = {}): TimelineItem {
  return {
    id: 'timeline-1',
    kind: 'experience',
    title: '某公司',
    role: '前端实习生',
    startDate: '2025-07',
    endDate: null,
    description: '参与内部管理系统的前端开发。',
    tags: [],
    order: 0,
    ...overrides,
  }
}

export function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    slug: 'campus-map',
    title: '校园地图',
    summary: '一个用于测试的项目摘要。',
    role: '前端开发',
    category: '课程项目',
    startDate: '2025-03',
    endDate: '2025-06',
    techStack: ['React'],
    highlights: [],
    content: '## 背景\n\n项目背景说明。',
    repoUrl: null,
    demoUrl: null,
    featured: false,
    order: 0,
    updatedAt: FIXED_TIMESTAMP,
    ...overrides,
  }
}

export function buildPost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'post-1',
    slug: 'hello-world',
    title: '第一篇文章',
    summary: '用于测试的文章摘要。',
    tags: ['前端'],
    publishedAt: '2026-01-01',
    updatedAt: FIXED_TIMESTAMP,
    status: 'published',
    content: '## 标题\n\n正文内容。',
    ...overrides,
  }
}

export function buildSettings(overrides: Partial<SiteSettings> = {}): SiteSettings {
  return {
    siteTitle: '测试站点',
    siteDescription: '测试用站点描述',
    footerText: '',
    starfieldEnabled: true,
    postsPerPage: 6,
    resumeAssetId: null,
    updatedAt: FIXED_TIMESTAMP,
    ...overrides,
  }
}

/**
 * 默认基线状态：只在这里跑一次 schema 校验，用来确认工厂默认值本身合法。
 * 用例需要构造"刻意非法"的数据（例如超长标题）时不能再走 parse，
 * 否则工厂会先于断言抛出 ZodError，掩盖真正的失败位置。
 */
const defaultContentState = contentStateSchema.parse({
  version: CONTENT_STATE_VERSION,
  updatedAt: FIXED_TIMESTAMP,
  profile: buildProfile(),
  skillCategories: [buildSkillCategory()],
  skills: [buildSkill()],
  timeline: [buildTimelineItem()],
  projects: [buildProject()],
  posts: [buildPost()],
  settings: buildSettings(),
}) satisfies ContentState

/** 构造内容状态；传入的部分集合会替换默认值，未传入的保持默认 */
export function buildContentState(overrides: Partial<ContentState> = {}): ContentState {
  return { ...defaultContentState, ...overrides }
}

/** 造一个 File，用于文件校验与导入相关用例 */
export function buildFile(content: string, fileName: string, type: string): File {
  return new File([content], fileName, { type })
}

/**
 * 造一个"体积为 size 字节"的 File，不实际分配内容。
 * 文件校验只读取 name / size / type，因此这里用 defineProperty 直接给出体积。
 */
export function buildFileWithSize(fileName: string, type: string, size: number): File {
  const file = new File([''], fileName, { type })
  Object.defineProperty(file, 'size', { value: size, configurable: true })
  return file
}
