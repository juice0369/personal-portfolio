/**
 * 全局常量：存储键、容量限制、演示凭证与回落资源。
 * 这里是这些取值的唯一来源，其余模块一律从此处导入。
 */

/** 内容数据结构的版本号，与存储键中的版本号同步递增 */
export const CONTENT_STATE_VERSION = 1

/** localStorage 键：完整内容数据（不含二进制文件） */
export const CONTENT_STORAGE_KEY = 'portfolio:content:v1'

/** sessionStorage 键：演示登录的会话标记 */
export const AUTH_STORAGE_KEY = 'portfolio:auth:v1'

/** IndexedDB 库名与存储名：头像与简历的二进制内容 */
export const ASSET_DB_NAME = 'portfolio-assets'
export const ASSET_STORE_NAME = 'assets'

/** 容量上限（TECH_DESIGN §6.1） */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const RESUME_MAX_BYTES = 5 * 1024 * 1024
export const IMPORT_MAX_BYTES = 2 * 1024 * 1024

/** 允许的文件格式（扩展名到 MIME 的对应关系见 lib/file-validation.ts） */
export const AVATAR_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const RESUME_MIME_TYPES = ['application/pdf']
export const IMPORT_MIME_TYPES = ['application/json', 'text/plain']

/** 博客每页条数的默认值与允许范围 */
export const DEFAULT_POSTS_PER_PAGE = 6
export const MIN_POSTS_PER_PAGE = 3
export const MAX_POSTS_PER_PAGE = 24

/**
 * 演示凭证。
 *
 * 这是**公开的演示账号**，不是密钥、不是 Token，也不具备任何安全价值：
 * 它明文出现在前端源码与 README 中，任何人都可以读取。
 * 登录仅用于区分"进入后台页面"与"不进入后台页面"，不构成安全边界。
 * 详见 AGENTS.md §6.1 与 README 的"演示登录"章节。
 */
export const DEMO_CREDENTIALS = {
  username: 'test',
  password: '123456',
} as const

/** 未上传文件时的内置回落资源 */
export const FALLBACK_AVATAR_URL = '/default-avatar.jpg'
/** 内置简历：站点所有者本人的简历文件，随仓库与构建产物发布（AGENTS.md §6.2） */
export const FALLBACK_RESUME_URL = '/resume-sample.pdf'

/** 站点标题的兜底值（首次渲染时使用，加载后由站点设置覆盖） */
export const SITE_TITLE_FALLBACK = '个人作品集'

/** 弹窗内 Markdown 预览的防抖时长 */
export const MARKDOWN_PREVIEW_DEBOUNCE_MS = 200
