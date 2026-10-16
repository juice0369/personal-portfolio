import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useContent } from '../content/useContent'
import { ResumeDownloadButton } from '../components/ResumeDownloadButton'
import { ButtonLink } from '../components/ui/Button'
import { IconMenu } from '../components/icons'
import { NAV_LINKS } from './nav-links'
import { MobileNav } from './MobileNav'

/**
 * 响应式导航栏（F-11）。
 * 桌面端横向展示全部链接；移动端折叠为抽屉，抽屉关闭后焦点回到菜单按钮。
 */
export function SiteHeader() {
  const { state } = useContent()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // 路由变化后收起移动端菜单，避免菜单遮住目标页面
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search, location.hash])

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-900/95">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="min-h-11 max-w-[10rem] truncate rounded-control py-2 text-sm font-semibold tracking-tight text-parchment-100 focus-visible:focus-ring sm:max-w-none sm:text-base"
        >
          {state.settings.siteTitle}
        </Link>

        {/* 登录后台入口紧挨站点标题，桌面与移动端都可见（PRD F-01、F-11） */}
        <ButtonLink to="/admin/login" variant="secondary" size="sm" className="shrink-0">
          登录后台
        </ButtonLink>

        <nav aria-label="主导航" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = link.match(location.pathname, location.hash)
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'inline-flex min-h-11 items-center rounded-control px-3 text-sm transition-colors duration-150 focus-visible:focus-ring motion-reduce:transition-none',
                      active ? 'text-champagne-400' : 'text-parchment-300 hover:text-parchment-100',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-1">
          <ResumeDownloadButton variant="secondary" size="sm" label="简历" />
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-ink-600 text-parchment-300 hover:text-parchment-100 focus-visible:focus-ring md:hidden"
          >
            <span className="text-base">
              <IconMenu />
            </span>
            <span className="sr-only">打开导航菜单</span>
          </button>
        </div>
      </div>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
