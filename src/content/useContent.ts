import { createContext, useContext } from 'react'
import type { ContentState } from '../lib/schema'
import type { ContentAction } from './content-reducer'

/**
 * 前台与后台共用的运行时状态上下文。
 * `useContent()` 是访问内容数据的唯一入口（AGENTS.md §4.2）。
 */
export type ContentContextValue = {
  state: ContentState
  /** 唯一的状态变更入口：同步更新内存状态并持久化到 localStorage */
  dispatch: (action: ContentAction) => void
  /** 整体替换（导入数据） */
  replaceAll: (next: ContentState) => void
  /** 恢复内置默认数据：清空 localStorage 与 IndexedDB */
  resetToSeed: () => Promise<void>
  /** 本地数据不合法而回落到内置数据时为 true，界面据此显示一次性提示 */
  didFallback: boolean
  fallbackMessages: string[]
  /** 资源（头像 / 简历）被替换后自增，用于让 useAssetUrl 重新生成 object URL */
  assetsRevision: number
  notifyAssetChange: () => void
}

export const ContentContext = createContext<ContentContextValue | null>(null)

export function useContent(): ContentContextValue {
  const value = useContext(ContentContext)
  if (value === null) {
    throw new Error('useContent 必须在 ContentProvider 内部使用')
  }
  return value
}
