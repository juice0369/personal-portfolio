import { useEffect } from 'react'
import { useContent } from '../content/useContent'

/**
 * 页面标题与描述同步到站点设置（AC-F19：修改站点标题后浏览器标签页同步更新）。
 * 由各个页面自己调用，避免父布局覆盖子页面的标题。
 */
export function useDocumentTitle(pageTitle?: string): void {
  const { state } = useContent()
  const { siteTitle, siteDescription } = state.settings

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · ${siteTitle}` : siteTitle

    const meta = document.querySelector('meta[name="description"]')
    if (meta && siteDescription.length > 0) {
      meta.setAttribute('content', siteDescription)
    }
  }, [pageTitle, siteTitle, siteDescription])
}
