import { Outlet } from 'react-router'
import { Starfield } from '../components/Starfield'
import { SkipLink } from '../components/ui/SkipLink'
import { useHashScroll } from '../hooks/useHashScroll'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/**
 * 前台框架：星空背景 + 响应式导航 + 主内容 + 页脚。
 * 星空背景为固定定位且不接收鼠标事件，主内容位于其上的不透明面板中（PRD §8.3）。
 */
export function PublicLayout() {
  useHashScroll()

  return (
    <div className="relative flex min-h-screen flex-col">
      <Starfield />
      <SkipLink />
      <SiteHeader />
      <main id="main" className="relative z-10 flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
