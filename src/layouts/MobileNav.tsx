import { Link, useLocation } from 'react-router'
import { ResumeDownloadButton } from '../components/ResumeDownloadButton'
import { DialogShell } from '../components/ui/DialogShell'
import { NAV_LINKS } from './nav-links'

/**
 * 移动端抽屉导航（AC-F11）：
 * 覆盖式抽屉、Esc 关闭、点击遮罩关闭、关闭后焦点回到触发按钮（由 useFocusTrap 保证）。
 */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation()

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      labelledBy="mobile-nav-title"
      placement="right"
      closeLabel="关闭导航菜单"
    >
      <div className="border-b border-ink-700 px-5 py-4 pr-14">
        <h2 id="mobile-nav-title" className="text-base font-semibold text-parchment-100">
          导航
        </h2>
      </div>

      <nav aria-label="移动端导航" id="mobile-nav" className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-1">
          {NAV_LINKS.map((link) => {
            const active = link.match(location.pathname, location.hash)
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'flex min-h-11 items-center rounded-control px-3 text-base focus-visible:focus-ring',
                    active ? 'text-champagne-400' : 'text-parchment-100 hover:bg-ink-700',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-ink-700 px-5 py-4">
        <ResumeDownloadButton variant="secondary" size="sm" block />
        <p className="mt-3 text-xs leading-5 text-parchment-500">
          简历下载优先使用管理员上传的 PDF，未上传时为内置示例文件。
        </p>
      </div>
    </DialogShell>
  )
}
