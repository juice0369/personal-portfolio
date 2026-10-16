import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ConfirmContext, type ConfirmContextValue, type ConfirmOptions } from './confirm-context'

/** 命令式二次确认的提供者：confirm(options) 返回用户是否确认 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null)

  const confirm = useCallback((next: ConfirmOptions) => {
    resolverRef.current?.(false)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setOptions(next)
    })
  }, [])

  const settle = useCallback((confirmed: boolean) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setOptions(null)
    resolve?.(confirmed)
  }, [])

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={options !== null}
        title={options?.title ?? ''}
        description={options?.description}
        confirmLabel={options?.confirmLabel ?? '确认'}
        cancelLabel={options?.cancelLabel}
        tone={options?.tone ?? 'danger'}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  )
}
