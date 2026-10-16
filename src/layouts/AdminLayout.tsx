import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { DialogShell } from '../components/ui/DialogShell'
import { SkipLink } from '../components/ui/SkipLink'
import { AdminSidebarNav } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'

/**
 * 后台框架（TECH_DESIGN §2）：侧边导航 + 顶栏 + 内容区。
 * 侧边栏在 md 以下折叠为抽屉，Esc 或点击遮罩关闭（AC-F11、AC-X04）。
 */
export function AdminLayout() {
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-ink-900">
      <SkipLink />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        <aside className="hidden shrink-0 border-ink-700 md:block md:w-64 md:border-r">
          <div className="sticky top-0 p-4">
            <AdminSidebarNav />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar onOpenNav={() => setNavOpen(true)} />
          <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      <DialogShell
        open={navOpen}
        onClose={() => setNavOpen(false)}
        labelledBy="admin-nav-title"
        placement="right"
        closeLabel="关闭后台导航"
      >
        <div className="border-b border-ink-700 px-5 py-4 pr-14">
          <h2 id="admin-nav-title" className="text-base font-semibold text-parchment-100">
            后台导航
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <AdminSidebarNav onNavigate={() => setNavOpen(false)} />
        </div>
      </DialogShell>
    </div>
  )
}
