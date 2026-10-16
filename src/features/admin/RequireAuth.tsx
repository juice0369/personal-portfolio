import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { readSession } from '../../lib/storage/auth-store'

/**
 * 后台守卫（F-13）。
 *
 * 只做界面分流：会话标记存在时渲染后台，否则重定向到登录页并带上回跳地址。
 * 这不构成安全边界——标记写在前端可读的 sessionStorage 中，任何人手动写入即可绕过
 * （AGENTS.md §6.1、PRD §11.1）。
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()

  if (readSession() === null) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />
  }

  return <>{children}</>
}
