import type { ComponentPropsWithoutRef } from 'react'
import { controlClass } from './control-styles'

export function Textarea({
  invalid,
  className,
  ...rest
}: ComponentPropsWithoutRef<'textarea'> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={controlClass({ invalid, className: `min-h-28 py-2 leading-6 ${className ?? ''}` })}
      {...rest}
    />
  )
}
