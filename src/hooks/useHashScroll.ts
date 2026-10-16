import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { usePrefersReducedMotion } from './useMediaQuery'

/**
 * 锚点滚动（TECH_DESIGN §3.2 第 3 条）：
 * 路由或 hash 变化后把目标区块滚入视口；没有 hash 时回到页面顶部。
 * 开启"减少动态效果"时改为即时跳转（X-05）。
 */
export function useHashScroll(): void {
  const location = useLocation()
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth'

    if (location.hash.length > 1) {
      const id = decodeURIComponent(location.hash.slice(1))
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ behavior, block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
    // location.key 在每次导航时变化，保证同一路径下重复点击也能生效
  }, [location.pathname, location.hash, location.key, reduceMotion])
}
