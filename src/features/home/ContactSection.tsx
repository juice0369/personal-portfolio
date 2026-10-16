import { useContent } from '../../content/useContent'
import { SectionHeading } from '../../components/SectionHeading'
import { Card } from '../../components/ui/Card'
import { SocialIcon, IconMail, IconMapPin, IconPhone } from '../../components/icons'

/** 联系方式（F-10 / AC-F10）：未填写的条目完全不渲染，不出现"未填写"占位 */
export function ContactSection() {
  const { state } = useContent()
  const { profile } = state

  const items = [
    {
      key: 'email',
      label: '邮箱',
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: <IconMail />,
    },
    profile.phone.length > 0
      ? {
          key: 'phone',
          label: '手机',
          value: profile.phone,
          href: `tel:${profile.phone.replace(/[^\d+]/g, '')}`,
          icon: <IconPhone />,
        }
      : null,
    profile.location.length > 0
      ? {
          key: 'location',
          label: '所在城市',
          value: profile.location,
          href: null,
          icon: <IconMapPin />,
        }
      : null,
  ].filter((item) => item !== null)

  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-24">
      <SectionHeading
        eyebrow="取得联系"
        id="contact-title"
        title="联系方式"
        description="邮件是最快的方式；社交平台也可以直接找到我。"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.key} className="flex items-start gap-3">
                <span className="mt-0.5 text-base text-champagne-400">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs text-parchment-500">{item.label}</p>
                  {item.href !== null ? (
                    <a
                      href={item.href}
                      className="rounded-control text-sm break-all text-parchment-100 underline underline-offset-4 hover:text-champagne-200 focus-visible:focus-ring"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm break-all text-parchment-100">{item.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-parchment-100">社交平台</h3>
          {profile.socials.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-parchment-300">
              还没有添加社交链接，可在后台「个人信息」中补充。
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
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
          )}
        </Card>
      </div>
    </section>
  )
}
