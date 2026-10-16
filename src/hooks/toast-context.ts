import { createContext, useContext } from 'react'

/**
 * 提示（Toast）：保存成功、删除成功、错误等结果的统一出口。
 * 容器是 aria-live="polite" 实时区域，因此屏幕阅读器会播报（PRD §8.4 第 7 条）。
 */

export type ToastLevel = 'success' | 'error' | 'info'

export type ToastAction = {
  label: string
  onClick: () => void
}

export type Toast = {
  id: string
  level: ToastLevel
  message: string
  action?: ToastAction
}

export type PushToastInput = {
  level: ToastLevel
  message: string
  action?: ToastAction
  /** 0 表示不自动消失（错误提示默认如此） */
  durationMs?: number
}

export type ToastContextValue = {
  toasts: Toast[]
  pushToast: (input: PushToastInput) => string
  dismissToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (value === null) {
    throw new Error('useToast 必须在 ToastProvider 内部使用')
  }
  return value
}
