import { useCallback, useEffect, useState } from 'react'
import type { AssetId, AssetRef } from '../lib/schema'
import { getStoredAsset } from '../lib/storage/asset-db'
import { useContent } from '../content/useContent'

export type AssetUrlState = {
  url: string | null
  ref: AssetRef | null
  loading: boolean
}

const EMPTY: AssetUrlState = { url: null, ref: null, loading: false }

/**
 * 把 IndexedDB 中的 Blob 转成 object URL，并负责释放（AGENTS.md 常见坑）。
 *
 * - 依赖 assetsRevision：上传或删除文件后重新读取，避免继续使用旧 URL；
 * - 依赖变化或卸载时 revokeObjectURL，并用 cancelled 标记避免异步竞态导致泄漏。
 */
export function useAssetUrl(id: AssetId | null): AssetUrlState {
  const { assetsRevision } = useContent()
  const [state, setState] = useState<AssetUrlState>(
    id === null ? EMPTY : { ...EMPTY, loading: true },
  )

  useEffect(() => {
    if (id === null) {
      setState(EMPTY)
      return
    }

    let cancelled = false
    let createdUrl: string | null = null
    setState({ ...EMPTY, loading: true })

    getStoredAsset(id)
      .then((asset) => {
        if (cancelled) return
        if (!asset) {
          setState(EMPTY)
          return
        }
        createdUrl = URL.createObjectURL(asset.blob)
        setState({
          url: createdUrl,
          ref: {
            id: asset.id,
            kind: asset.kind,
            fileName: asset.fileName,
            mimeType: asset.mimeType,
            size: asset.size,
            updatedAt: asset.updatedAt,
          },
          loading: false,
        })
      })
      .catch(() => {
        if (!cancelled) setState(EMPTY)
      })

    return () => {
      cancelled = true
      if (createdUrl !== null) URL.revokeObjectURL(createdUrl)
    }
  }, [id, assetsRevision])

  return state
}

/** 仅供上传组件使用：把文件读成 object URL 做即时预览，并在清理时释放 */
export function useObjectUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const next = URL.createObjectURL(blob)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [blob])
  return url
}

/** 触发浏览器下载：统一走 object URL，不使用 fetch */
export function useDownload(): (url: string, fileName: string) => void {
  return useCallback((url: string, fileName: string) => {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.rel = 'noopener'
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
  }, [])
}
