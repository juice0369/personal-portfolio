import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Link } from 'react-router'
import { buttonClass, type ButtonSize, type ButtonVariant } from './button-styles'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
}

export function Button({ variant, size, block, className, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={buttonClass({ variant, size, block, className })}
      {...rest}
    />
  )
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
}

/** 站内链接按钮：与 Button 视觉一致，但使用 Link 保持客户端路由 */
export function ButtonLink({ variant, size, block, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass({ variant, size, block, className })} {...rest} />
}

type ExternalLinkButtonProps = ComponentPropsWithoutRef<'a'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
}

/** 外链按钮：统一补上 rel，避免来源泄漏与 window.opener 隐患（AGENTS.md §6.3） */
export function ExternalLinkButton({
  variant,
  size,
  block,
  className,
  children,
  ...rest
}: ExternalLinkButtonProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass({ variant, size, block, className })}
      {...rest}
    >
      {children}
    </a>
  )
}

/** 图标按钮：必须提供可访问名称（label），否则屏幕阅读器无法识别 */
export function IconButton({
  label,
  variant = 'ghost',
  size = 'sm',
  className,
  children,
  ...rest
}: Omit<ButtonProps, 'children' | 'aria-label'> & { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={buttonClass({ variant, size, className })}
      {...rest}
    >
      {children}
    </button>
  )
}
