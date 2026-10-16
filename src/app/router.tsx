import { Suspense, lazy, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { PageSkeleton } from '../components/ui/Skeleton'
import { ErrorBoundary } from './ErrorBoundary'

/**
 * 路由表（唯一来源，TECH_DESIGN §3）。
 *
 * - 页面全部懒加载：后台代码不进入首屏包，未访问到的页面不会被打包进入口 chunk。
 * - 每个页面单独套一层 Suspense，加载页面时导航栏与页脚保持可见。
 * - 顶层挂 ErrorBoundary，渲染异常时给出兜底页面而不是白屏。
 */

const PublicLayout = lazy(() =>
  import('../layouts/PublicLayout').then((module) => ({ default: module.PublicLayout })),
)
const HomePage = lazy(() =>
  import('../features/home/HomePage').then((module) => ({ default: module.HomePage })),
)
const ProjectListPage = lazy(() =>
  import('../features/projects/ProjectListPage').then((module) => ({
    default: module.ProjectListPage,
  })),
)
const ProjectDetailPage = lazy(() =>
  import('../features/projects/ProjectDetailPage').then((module) => ({
    default: module.ProjectDetailPage,
  })),
)
const PostListPage = lazy(() =>
  import('../features/blog/PostListPage').then((module) => ({ default: module.PostListPage })),
)
const PostDetailPage = lazy(() =>
  import('../features/blog/PostDetailPage').then((module) => ({ default: module.PostDetailPage })),
)
const NotFoundPage = lazy(() =>
  import('../features/not-found/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
)

const LoginPage = lazy(() =>
  import('../features/admin/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const AdminLayout = lazy(() =>
  import('../layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })),
)
const RequireAuth = lazy(() =>
  import('../features/admin/RequireAuth').then((module) => ({ default: module.RequireAuth })),
)
const DashboardPage = lazy(() =>
  import('../features/admin/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const ProfilePage = lazy(() =>
  import('../features/admin/profile/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  })),
)
const SkillsPage = lazy(() =>
  import('../features/admin/skills/SkillsPage').then((module) => ({ default: module.SkillsPage })),
)
const ProjectsPage = lazy(() =>
  import('../features/admin/projects/ProjectsPage').then((module) => ({
    default: module.ProjectsPage,
  })),
)
const PostsPage = lazy(() =>
  import('../features/admin/posts/PostsPage').then((module) => ({ default: module.PostsPage })),
)
const PostEditorPage = lazy(() =>
  import('../features/admin/posts/PostEditorPage').then((module) => ({
    default: module.PostEditorPage,
  })),
)
const SettingsPage = lazy(() =>
  import('../features/admin/settings/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
)

function withSuspense(node: ReactNode): ReactNode {
  return <Suspense fallback={<PageSkeleton />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  {
    // 顶层无路径路由：只承担错误兜底与加载边界
    ErrorBoundary,
    children: [
      {
        element: withSuspense(<PublicLayout />),
        children: [
          { index: true, element: withSuspense(<HomePage />) },
          { path: 'projects', element: withSuspense(<ProjectListPage />) },
          { path: 'projects/:slug', element: withSuspense(<ProjectDetailPage />) },
          { path: 'blog', element: withSuspense(<PostListPage />) },
          { path: 'blog/:slug', element: withSuspense(<PostDetailPage />) },
          { path: '*', element: withSuspense(<NotFoundPage />) },
        ],
      },
      {
        // 登录页不套后台框架：独立全屏布局
        path: 'admin/login',
        element: withSuspense(<LoginPage />),
      },
      {
        path: 'admin',
        element: withSuspense(
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>,
        ),
        children: [
          { index: true, element: withSuspense(<DashboardPage />) },
          { path: 'profile', element: withSuspense(<ProfilePage />) },
          { path: 'skills', element: withSuspense(<SkillsPage />) },
          { path: 'projects', element: withSuspense(<ProjectsPage />) },
          { path: 'posts', element: withSuspense(<PostsPage />) },
          { path: 'posts/new', element: withSuspense(<PostEditorPage mode="create" />) },
          { path: 'posts/:id/edit', element: withSuspense(<PostEditorPage mode="edit" />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
          // 后台下的未知子路径回到仪表盘，避免落到前台的 404
          { path: '*', element: <Navigate to="/admin" replace /> },
        ],
      },
    ],
  },
])
