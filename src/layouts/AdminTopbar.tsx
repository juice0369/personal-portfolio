import { Link, useNavigate } from 'react-router'
import { DEMO_CREDENTIALS } from '../lib/constants'
import { clearSession, readSession } from '../lib/storage/auth-store'
import { useToast } from '../hooks/toast-context'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { IconLogOut, IconMenu } from '../components/icons'

/**
 * 后台顶栏：移动端菜单按钮、演示模式提示、当前登录用户、返回前台与退出登录。
 * "仅供课程演示"的提示必须常驻（AGENTS.md §6.1），不得删除。
 */
export function AdminTopbar({ onOpenNav }: { onOpenNav: () => void }) {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const session = readSession()

  return (
    <header className="sticky top-0 z-30 border-b border-ink-700 bg-ink-900/95">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="打开后台导航"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-ink-600 text-parchment-300 hover:text-parchment-100 focus-visible:focus-ring md:hidden"
        >
          <IconMenu />
        </button>

        <p className="hidden text-xs leading-5 text-parchment-500 md:block">
          演示登录：{DEMO_CREDENTIALS.username}（前端明文凭证，仅用于课程演示，非生产级安全系统）
        </p>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:inline-flex">
            <Badge tone="danger">仅供课程演示</Badge>
          </span>
          {session !== null ? (
            <span className="hidden text-xs text-parchment-300 sm:inline">
              当前用户：{session.user}
            </span>
          ) : null}
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-control px-3 text-sm text-parchment-300 hover:text-champagne-200 focus-visible:focus-ring"
          >
            返回前台
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              clearSession()
              pushToast({ level: 'info', message: '已退出登录' })
              navigate('/admin/login', { replace: true })
            }}
          >
            <IconLogOut />
            退出
          </Button>
        </div>
      </div>

      {/* 窄屏放不下顶栏内的完整说明，因此单独占一行显示；
          该提示必须常驻，不得删除（AGENTS.md §6.1） */}
      <p className="border-t border-ink-700 px-4 py-2 text-xs leading-5 text-parchment-500 md:hidden">
        仅供课程演示，非生产级安全系统
      </p>
    </header>
  )
}
