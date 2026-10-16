import type { ReactNode } from 'react'
import { ConfirmProvider } from '../hooks/ConfirmProvider'
import { ToastProvider } from '../hooks/ToastProvider'
import { ContentProvider } from '../content/ContentProvider'

/**
 * 全局 Provider 组合（TECH_DESIGN §2）。
 *
 * 依赖顺序：ContentProvider 在保存失败时会推送提示，因此必须位于 ToastProvider 内部；
 * ConfirmProvider 提供命令式的二次确认，供后台所有破坏性操作使用（X-01）。
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <ContentProvider>{children}</ContentProvider>
      </ConfirmProvider>
    </ToastProvider>
  )
}
