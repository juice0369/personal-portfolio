import { Link } from 'react-router'
import { useContent } from '../content/useContent'
import { currentYear } from '../lib/date'
import { ResumeDownloadButton } from '../components/ResumeDownloadButton'
import { SocialIcon } from '../components/icons'
import { NAV_LINKS } from './nav-links'

/** 页脚（F-12）：站点标题、描述、社交链接、简历下载与版权行 */
export function SiteFooter() {
  const { state } = useContent()
  const { settings, profile } = state

  return (
    <footer className="relative z-10 border-t border-ink-700 bg-ink-900">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:px-8">
        <div>
          <p className="text-base font-semibold text-parchment-100">{settings.siteTitle}</p>
          {settings.siteDescription.length > 0 ? (
            <p className="mt-2 max-w-[46ch] text-sm leading-6 text-parchment-300">
              {settings.siteDescription}
            </p>
          ) : null}
          <div className="mt-4">
            <ResumeDownloadButton variant="secondary" size="sm" />
          </div>
        </div>

        <div className="sm:text-right">
          <nav aria-label="页脚导航">
            <ul className="flex flex-wrap gap-x-1 gap-y-1 sm:justify-end">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-parchment-300 hover:text-champagne-200 focus-visible:focus-ring"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {profile.socials.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2 sm:justify-end">
              {profile.socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-control border border-ink-600 px-3 text-sm text-parchment-300 hover:border-champagne-400 hover:text-champagne-200 focus-visible:focus-ring"
                  >
                    <SocialIcon name={social.icon} />
                    {social.label}
                    <span className="sr-only">（在新标签页打开）</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="border-t border-ink-700">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-5 text-xs text-parchment-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {currentYear()} {profile.name}
          </p>
          {settings.footerText.length > 0 ? <p>{settings.footerText}</p> : null}
        </div>
      </div>
    </footer>
  )
}
