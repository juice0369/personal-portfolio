import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createId } from '../lib/id'
import { IconAlert, IconCheck, IconClose, IconInfo } from '../components/icons'
import {
  ToastContext,
  type PushToastInput,
  type Toast,
  type ToastContextValue,
  type ToastLevel,
} from './toast-context'

const AUTO_DISMISS_MS = 5000
const AUTO_DISMISS_WITH_ACTION_MS = 9000

const LEVEL_STYLES: Record<ToastLevel, string> = {
  success: 'border-champagne-400/40 text-parchment-100',
  error: 'border-danger-400/60 text-parchment-100',
  info: 'border-ink-600 text-parchment-100',
}

function LevelIcon({ level }: { level: ToastLevel }) {
  if (level === 'success') return <IconCheck className="text-champagne-400" />
  if (level === 'error') return <IconAlert className="text-danger-400" />
  return <IconInfo className="text-parchment-500" />
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, number>())

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const pushToast = useCallback(
    (input: PushToastInput) => {
      const id = createId()
      setToasts((prev) => [...prev.slice(-3), { id, ...input }])

      // 错误提示不自动消失，必须由用户关闭（TECH_DESIGN §13）
      const fallback = input.action ? AUTO_DISMISS_WITH_ACTION_MS : AUTO_DISMISS_MS
      const duration = input.durationMs ?? (input.level === 'error' ? 0 : fallback)
      if (duration > 0) {
        const timer = window.setTimeout(() => dismissToast(id), duration)
        timers.current.set(id, timer)
      }
      return id
    },
    [dismissToast],
  )

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer))
      pending.clear()
    }
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, pushToast, dismissToast }),
    [toasts, pushToast, dismissToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-3 bottom-3 z-50 flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[22rem]"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-card border bg-ink-800 px-4 py-3 shadow-panel ${LEVEL_STYLES[toast.level]}`}
          >
            <span className="mt-0.5 shrink-0 text-base">
              <LevelIcon level={toast.level} />
            </span>
            <p className="flex-1 text-sm leading-6">{toast.message}</p>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick()
                  dismissToast(toast.id)
                }}
                className="shrink-0 rounded-control px-2 py-1 text-sm font-medium text-champagne-400 hover:text-champagne-200 focus-visible:focus-ring"
              >
                {toast.action.label}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="关闭提示"
              className="shrink-0 rounded-control p-1 text-parchment-500 hover:text-parchment-100 focus-visible:focus-ring"
            >
              <IconClose />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
