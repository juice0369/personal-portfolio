import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { controlClass } from './control-styles'

export function Select({
  invalid,
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<'select'> & { invalid?: boolean; children: ReactNode }) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={controlClass({ invalid, className: `pr-8 ${className ?? ''}` })}
      {...rest}
    >
      {children}
    </select>
  )
}
