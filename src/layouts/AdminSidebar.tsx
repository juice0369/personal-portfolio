import { Link, useLocation } from 'react-router'
import { useContent } from '../content/useContent'
import { ADMIN_NAV_LINKS } from './nav-links'
import { Badge } from '../components/ui/Badge'
import {
  IconDashboard,
  IconFileText,
  IconFolder,
  IconLayers,
  IconSettings,
  IconUser,
} from '../components/icons'

/** 图标名 → 组件。集中映射，避免在数据里存组件导致无法序列化 */
const ICONS = {
  dashboard: IconDashboard,
  user: IconUser,
  layers: IconLayers,
  folder: IconFolder,
  file: IconFileText,
  settings: IconSettings,
} as const

/** 后台侧边导航内容；桌面端放在侧栏、移动端放在抽屉里，因此内容单独抽出来 */
export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const { state } = useContent()

  return (
    <div>
      <div className="px-2 pb-5">
        <p className="text-xs font-medium tracking-[0.18em] text-champagne-400">管理后台</p>
        <p className="mt-1 text-sm font-semibold text-parchment-100">{state.settings.siteTitle}</p>
        <p className="mt-2">
          <Badge tone="danger">演示模式</Badge>
        </p>
      </div>

      <nav aria-label="后台导航">
        <ul className="space-y-1">
          {ADMIN_NAV_LINKS.map((link) => {
            const Icon = ICONS[link.icon]
            const active =
              link.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(link.to)

            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'flex min-h-11 items-center gap-3 rounded-control px-3 text-sm transition-colors duration-150 focus-visible:focus-ring motion-reduce:transition-none',
                    active
                      ? 'bg-ink-700 text-champagne-400'
                      : 'text-parchment-300 hover:bg-ink-800 hover:text-parchment-100',
                  ].join(' ')}
                >
                  <span className="text-base">
                    <Icon />
                  </span>
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <p className="mt-6 rounded-control border border-ink-700 bg-ink-900 px-3 py-2.5 text-xs leading-5 text-parchment-500">
        内容保存在当前浏览器本地。换设备或清理浏览器数据前，请先在
        <Link
          to="/admin/settings"
          onClick={onNavigate}
          className="mx-1 text-champagne-400 underline underline-offset-4 hover:text-champagne-200 focus-visible:focus-ring"
        >
          站点设置
        </Link>
        中导出备份。
      </p>
    </div>
  )
}
