import { DEFAULT_POSTS_PER_PAGE } from '../lib/constants'
import { siteSettingsSchema, type SiteSettings } from '../lib/schema'

/** 内置默认站点设置（站点标题与描述中的个人信息来自 `周毅个人简历（大连海事大学27届）.pdf`） */
export const settings: SiteSettings = siteSettingsSchema.parse({
  siteTitle: '周毅的个人作品集',
  siteDescription:
    '计算机科学与技术专业本科生周毅的作品集：目标检测科研项目、学科竞赛经历与技能记录。',
  footerText: '使用 React、TypeScript 与 Tailwind CSS 构建，数据保存在浏览器本地。',
  starfieldEnabled: true,
  postsPerPage: DEFAULT_POSTS_PER_PAGE,
  resumeAssetId: null,
  updatedAt: '2026-10-16T00:00:00.000Z',
})
