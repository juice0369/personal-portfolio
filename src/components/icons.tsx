import type { ReactNode, SVGProps } from 'react'
import type { z } from 'zod'
import type { socialIconSchema } from '../lib/schema'

/**
 * 站内全部图标：内联 SVG，不引入任何图标库或网络字体（AGENTS.md §9）。
 * 图标一律标记为装饰性（aria-hidden），语义由相邻文字或按钮的可访问名称承担。
 *
 * github / zhihu / juejin / wechat / twitter / linkedin 使用几何化的简化标记，
 * 每个图标旁始终显示平台名称文字，因此不存在歧义。
 */

export type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function IconStar(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.9l6-.8z" />
    </Icon>
  )
}

export function IconMenu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  )
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  )
}

export function IconChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </Icon>
  )
}

export function IconChevronLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.5 6l-6 6 6 6" />
    </Icon>
  )
}

export function IconChevronRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 6l6 6-6 6" />
    </Icon>
  )
}

export function IconDownload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v10" />
      <path d="M8 10.5l4 4 4-4" />
      <path d="M5 18.5h14" />
    </Icon>
  )
}

export function IconUpload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 16V6" />
      <path d="M8 9.5l4-4 4 4" />
      <path d="M5 18.5h14" />
    </Icon>
  )
}

export function IconMail(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.8 7l8.2 6 8.2-6" />
    </Icon>
  )
}

export function IconPhone(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 3.8h3l1.4 3.4-2 1.4a11 11 0 006 6l1.4-2 3.4 1.4v3a2 2 0 01-2.2 2A16 16 0 015 6a2 2 0 012-2.2z" />
    </Icon>
  )
}

export function IconMapPin(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s6.5-5.6 6.5-10.5A6.5 6.5 0 005.5 10.5C5.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </Icon>
  )
}

export function IconExternalLink(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4l-8.5 8.5" />
      <path d="M18 14.5V19a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h4.5" />
    </Icon>
  )
}

export function IconGithub(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="7" cy="6" r="2.2" />
      <circle cx="7" cy="18" r="2.2" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M7 8.2v7.6" />
      <path d="M17 11.2c0 3.2-3.4 3.4-6.6 4" />
    </Icon>
  )
}

export function IconLink(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 13.8a3.6 3.6 0 005.1 0l2.6-2.6a3.6 3.6 0 00-5.1-5.1l-1 1" />
      <path d="M14 10.2a3.6 3.6 0 00-5.1 0l-2.6 2.6a3.6 3.6 0 005.1 5.1l1-1" />
    </Icon>
  )
}

export function IconTwitter(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.5 6.6l-8.2 9-3.4-3.4" />
      <path d="M20.5 6.6L11.5 20l-2-5.2L4 13.5z" />
    </Icon>
  )
}

export function IconZhihu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.5 4.5v9.8c0 1-.8 1.8-1.8 1.8h-3.4l-2.3 3.4-1.3-.6 1.5-2.8H5.3c-1 0-1.8-.8-1.8-1.8V4.5z" />
      <path d="M7.5 8.5h4M9.5 8.5v5" />
      <path d="M14.5 8.5h3M16 8.5v5" />
    </Icon>
  )
}

export function IconJuejin(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5l7 4.6-3 2-4-2.6-4 2.6-3-2z" />
      <path d="M12 12.2l6 3.9-6 3.9-6-3.9z" />
    </Icon>
  )
}

export function IconWechat(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 4.5c3.6 0 6.5 2.2 6.5 5s-2.9 5-6.5 5c-.8 0-1.5-.1-2.2-.3L4.5 15.5l.9-2.4A4.7 4.7 0 013 9.5c0-2.8 2.9-5 6.5-5z" />
      <path d="M17.8 11.4c1.9.6 3.2 2 3.2 3.7 0 1.2-.7 2.2-1.8 2.9l.7 1.9-2.2-1c-.6.2-1.2.3-1.8.3-1.7 0-3.2-.7-4.1-1.8" />
    </Icon>
  )
}

export function IconLinkedin(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.5V16" />
      <circle cx="8" cy="7.9" r="0.9" />
      <path d="M11.5 16v-3.2a2 2 0 014 0V16" />
      <path d="M11.5 10.5V16" />
    </Icon>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}

export function IconPencil(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15.5 4.8l3.7 3.7L8.4 19.3H4.7v-3.7z" />
      <path d="M13.6 6.7l3.7 3.7" />
    </Icon>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V4.8h5V7" />
      <path d="M6.5 7l.8 12.2h9.4L17.5 7" />
      <path d="M10.5 10.5v5.5M13.5 10.5v5.5" />
    </Icon>
  )
}

export function IconArrowUp(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19V5" />
      <path d="M6.5 10.5L12 5l5.5 5.5" />
    </Icon>
  )
}

export function IconArrowDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M17.5 13.5L12 19l-5.5-5.5" />
    </Icon>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12.8l4.4 4.4L19 7.2" />
    </Icon>
  )
}

export function IconAlert(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4.5l8.5 15h-17z" />
      <path d="M12 10v4.2" />
      <path d="M12 17.2h.01" />
    </Icon>
  )
}

export function IconInfo(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <path d="M12 8h.01" />
    </Icon>
  )
}

export function IconDashboard(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Icon>
  )
}

export function IconUser(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.8 20c1-3.7 3.9-5.5 7.2-5.5s6.2 1.8 7.2 5.5" />
    </Icon>
  )
}

export function IconLayers(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5l8.5 4.3L12 12.1 3.5 7.8z" />
      <path d="M4.5 12.5L12 16.3l7.5-3.8" />
      <path d="M4.5 16.5L12 20.3l7.5-3.8" />
    </Icon>
  )
}

export function IconFolder(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.8 6.5h5.4l1.8 2.2h9.2v9.3a1.5 1.5 0 01-1.5 1.5H5.3a1.5 1.5 0 01-1.5-1.5z" />
    </Icon>
  )
}

export function IconFileText(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3.5h7.5L18.5 8v12.5H6z" />
      <path d="M13.5 3.5V8h5" />
      <path d="M9 12.5h6M9 16h4.5" />
    </Icon>
  )
}

export function IconSettings(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.9 7.9l1.9 1.1M17.2 15l1.9 1.1M19.1 7.9l-1.9 1.1M6.8 15l-1.9 1.1" />
    </Icon>
  )
}

export function IconLogOut(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4.5H6.5a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5H14" />
      <path d="M14.5 12H20" />
      <path d="M17.5 9l3 3-3 3" />
    </Icon>
  )
}

export function IconHome(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10.5L12 4l8 6.5" />
      <path d="M6 10v10h12V10" />
    </Icon>
  )
}

export function IconEye(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.8 12S6 6.5 12 6.5 21.2 12 21.2 12 18 17.5 12 17.5 2.8 12 2.8 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </Icon>
  )
}

export function IconUndo(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 10.5h9a5 5 0 010 10H8" />
      <path d="M8 6.5l-4 4 4 4" />
    </Icon>
  )
}

export type SocialIconName = z.infer<typeof socialIconSchema>

/** 按站点设置中的图标名渲染对应图标，保证图标取值受 schema 约束 */
export function SocialIcon({ name, ...props }: IconProps & { name: SocialIconName }) {
  switch (name) {
    case 'github':
      return <IconGithub {...props} />
    case 'mail':
      return <IconMail {...props} />
    case 'twitter':
      return <IconTwitter {...props} />
    case 'zhihu':
      return <IconZhihu {...props} />
    case 'juejin':
      return <IconJuejin {...props} />
    case 'wechat':
      return <IconWechat {...props} />
    case 'linkedin':
      return <IconLinkedin {...props} />
    case 'link':
    default:
      return <IconLink {...props} />
  }
}
