/** 前台导航链接：集中定义，避免头部与页脚各写一份（.ts 文件，便于被多处导入） */

export type NavLink = {
  label: string
  to: string
  /** 判断当前是否处于该导航对应的位置 */
  match: (pathname: string, hash: string) => boolean
}

export const NAV_LINKS: NavLink[] = [
  {
    label: '首页',
    to: '/',
    match: (pathname, hash) => pathname === '/' && hash.length <= 1,
  },
  {
    label: '技能',
    to: '/#skills',
    match: (pathname, hash) => pathname === '/' && hash === '#skills',
  },
  {
    label: '经历',
    to: '/#timeline',
    match: (pathname, hash) => pathname === '/' && hash === '#timeline',
  },
  {
    label: '项目',
    to: '/projects',
    match: (pathname) => pathname.startsWith('/projects'),
  },
  {
    label: '博客',
    to: '/blog',
    match: (pathname) => pathname.startsWith('/blog'),
  },
  {
    label: '联系',
    to: '/#contact',
    match: (pathname, hash) => pathname === '/' && hash === '#contact',
  },
]

export const ADMIN_NAV_LINKS = [
  { label: '仪表盘', to: '/admin', icon: 'dashboard' as const },
  { label: '个人信息', to: '/admin/profile', icon: 'user' as const },
  { label: '技能', to: '/admin/skills', icon: 'layers' as const },
  { label: '项目', to: '/admin/projects', icon: 'folder' as const },
  { label: '博客', to: '/admin/posts', icon: 'file' as const },
  { label: '站点设置', to: '/admin/settings', icon: 'settings' as const },
]
