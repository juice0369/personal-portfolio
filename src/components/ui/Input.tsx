import type { ComponentPropsWithoutRef } from 'react'
import { controlClass } from './control-styles'

export function Input({
  invalid,
  className,
  ...rest
}: ComponentPropsWithoutRef<'input'> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={controlClass({ invalid, className })}
      {...rest}
    />
  )
}
