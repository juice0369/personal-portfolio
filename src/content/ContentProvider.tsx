import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { seedContent } from '../data'
import { CONTENT_STORAGE_KEY } from '../lib/constants'
import type { ContentState } from '../lib/schema'
import { clearContent, loadContent, saveContent } from '../lib/storage/content-store'
import { clearAssets } from '../lib/storage/asset-db'
import { useToast } from '../hooks/toast-context'
import { contentReducer, type ContentAction } from './content-reducer'
import { ContentContext, type ContentContextValue } from './useContent'

/**
 * 运行时状态层：加载 → 校验 → 回落 → 订阅跨标签页同步 → 每次变更持久化。
 *
 * 取值规则（TECH_DESIGN §5.1）：本地数据通过校验就整体采用，不与内置数据做字段级混合；
 * 校验失败视为"无本地数据"，采用内置数据并标记 didFallback。
 */

type InitialLoad = {
  state: ContentState
  didFallback: boolean
  fallbackMessages: string[]
}

function loadInitialState(): InitialLoad {
  const result = loadContent()
  if (result.ok) {
    return { state: result.state, didFallback: false, fallbackMessages: [] }
  }
  const didFallback = result.reason === 'invalid' || result.reason === 'unparsable'
  return { state: seedContent, didFallback, fallbackMessages: result.messages }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [initial] = useState<InitialLoad>(loadInitialState)
  const [state, setState] = useState<ContentState>(initial.state)
  const [assetsRevision, setAssetsRevision] = useState(0)
  const stateRef = useRef<ContentState>(initial.state)
  const { pushToast } = useToast()

  const applyState = useCallback((next: ContentState) => {
    stateRef.current = next
    setState(next)
  }, [])

  /** 唯一的状态变更入口：同步更新内存状态并写入 localStorage（避免"已保存但前台仍旧"） */
  const dispatch = useCallback(
    (action: ContentAction) => {
      const next = contentReducer(stateRef.current, action)
      applyState(next)

      const saved = saveContent(next)
      if (!saved.ok) {
        pushToast({ level: 'error', message: saved.message })
      }
    },
    [applyState, pushToast],
  )

  const replaceAll = useCallback(
    (next: ContentState) => {
      dispatch({ type: 'replaceAll', state: next })
    },
    [dispatch],
  )

  const resetToSeed = useCallback(async () => {
    // 清除本地数据与二进制文件后回到内置数据；此时不写入 localStorage，
    // 下次加载会因"无本地数据"而继续使用内置数据。
    clearContent()
    await clearAssets()
    applyState(seedContent)
    setAssetsRevision((value) => value + 1)
  }, [applyState])

  const notifyAssetChange = useCallback(() => {
    setAssetsRevision((value) => value + 1)
  }, [])

  // 跨标签页同步：storage 事件只在其他标签页触发，因此不会与本标签页的写入互相打架
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== CONTENT_STORAGE_KEY) return
      const result = loadContent()
      if (result.ok) {
        applyState(result.state)
      } else if (result.reason === 'empty') {
        applyState(seedContent)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [applyState])

  useEffect(() => {
    if (!initial.didFallback) return
    pushToast({
      level: 'error',
      message: '本地数据格式异常，已恢复为内置默认数据',
      durationMs: 0,
    })
  }, [initial.didFallback, pushToast])

  const value = useMemo<ContentContextValue>(
    () => ({
      state,
      dispatch,
      replaceAll,
      resetToSeed,
      didFallback: initial.didFallback,
      fallbackMessages: initial.fallbackMessages,
      assetsRevision,
      notifyAssetChange,
    }),
    [
      state,
      dispatch,
      replaceAll,
      resetToSeed,
      initial.didFallback,
      initial.fallbackMessages,
      assetsRevision,
      notifyAssetChange,
    ],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
