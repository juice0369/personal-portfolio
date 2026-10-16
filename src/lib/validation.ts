/**
 * 把 Zod 的校验错误转换成"字段路径 → 中文提示"，用于表单字段级错误。
 * 刻意只依赖 issues 的 path 与 message，不依赖具体版本的错误格式化 API。
 */

export type FieldErrors = Record<string, string>

export type IssueLike = { path: readonly PropertyKey[]; message: string }

/** 与 schema 字段名对应的中文标签，用于把 issues 描述成可读文案 */
const SEGMENT_LABELS: Record<string, string> = {
  version: '数据版本',
  updatedAt: '更新时间',
  profile: '个人资料',
  settings: '站点设置',
  skillCategories: '技能分类',
  skills: '技能',
  timeline: '经历时间线',
  projects: '项目',
  posts: '文章',

  name: '姓名',
  headline: '职业方向',
  bio: '个人简介',
  avatarAssetId: '头像',
  email: '邮箱',
  phone: '手机号',
  location: '所在城市',
  socials: '社交链接',
  icon: '图标',
  label: '链接名称',
  url: '链接地址',

  categoryId: '技能分类',
  level: '熟练度',
  description: '描述',
  order: '排序',
  kind: '类型',
  title: '标题',
  role: '专业或职位',
  startDate: '开始时间',
  endDate: '结束时间',
  tags: '标签',

  slug: '标识',
  summary: '摘要',
  category: '项目分类',
  techStack: '技术标签',
  highlights: '成果要点',
  content: '正文',
  repoUrl: '仓库地址',
  demoUrl: '演示地址',
  featured: '首页精选',

  publishedAt: '发布日期',
  status: '状态',

  siteTitle: '站点标题',
  siteDescription: '站点描述',
  footerText: '页脚文案',
  starfieldEnabled: '星空背景',
  postsPerPage: '每页条数',
  resumeAssetId: '简历文件',
}

function describeSegment(segment: PropertyKey): string {
  if (typeof segment === 'number') return `第 ${segment + 1} 项`
  const key = String(segment)
  return SEGMENT_LABELS[key] ?? key
}

/** issues[0].path = ['skills', 2, 'categoryId'] → '技能 · 第 3 项 · 技能分类' */
export function describeIssuePath(path: readonly PropertyKey[]): string {
  if (path.length === 0) return '数据'
  return path.map(describeSegment).join(' · ')
}

/** 按字段路径聚合错误，同一字段只保留第一条 */
export function issuesToFieldErrors(issues: readonly IssueLike[]): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of issues) {
    const key = issue.path.map((segment) => String(segment)).join('.')
    if (key.length === 0) continue
    if (!(key in errors)) errors[key] = issue.message
  }
  return errors
}

/** 生成带位置信息的可读错误列表，用于导入校验等场景 */
export function issuesToMessages(issues: readonly IssueLike[], limit = 5): string[] {
  return issues.slice(0, limit).map((issue) => `${describeIssuePath(issue.path)}：${issue.message}`)
}

/** 取第一条错误消息，找不到时返回兜底文案 */
export function firstIssueMessage(issues: readonly IssueLike[], fallback: string): string {
  const [first] = issuesToMessages(issues, 1)
  return first ?? fallback
}

/** 字段路径 → 错误文案（供表单组件按字段名查询） */
export function fieldError(errors: FieldErrors, name: string): string | undefined {
  return errors[name]
}
