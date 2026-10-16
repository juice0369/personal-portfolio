import { createContext, useContext, type ReactNode } from 'react'

/**
 * 二次确认（X-01）：所有破坏性操作都必须经过这里。
 * 命令式调用，避免为每个删除入口各写一份弹窗状态。
 */

export type ConfirmOptions = {
  title: string
  description?: ReactNode
  /** 确认按钮文案必须描述具体后果，例如"删除《课程管理平台》" */
  confirmLabel: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
}

export type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

export const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function useConfirm(): ConfirmContextValue['confirm'] {
  const value = useContext(ConfirmContext)
  if (value === null) {
    throw new Error('useConfirm 必须在 ConfirmProvider 内部使用')
  }
  return value.confirm
}
