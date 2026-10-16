import { AUTH_STORAGE_KEY } from '../constants'
import { nowTimestamp } from '../date'

/**
 * 演示登录的会话标记。
 *
 * 该标记只用于界面分流（是否允许进入后台页面），不构成安全边界：
 * 任何使用者都可以通过开发者工具直接写入该标记。详见 AGENTS.md §6.1。
 */

export type Session = {
  user: string
  loginAt: string
}

function getSessionStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.sessionStorage
  } catch {
    return null
  }
}

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return typeof record.user === 'string' && typeof record.loginAt === 'string'
}

export function readSession(): Session | null {
  const storage = getSessionStorage()
  if (!storage) return null

  try {
    const text = storage.getItem(AUTH_STORAGE_KEY)
    if (text === null) return null
    const parsed: unknown = JSON.parse(text)
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeSession(user: string): Session {
  const session: Session = { user, loginAt: nowTimestamp() }
  const storage = getSessionStorage()
  if (storage) {
    try {
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    } catch {
      // 写入失败时仍返回会话对象，让当前渲染周期保持已登录状态
    }
  }
  return session
}

export function clearSession(): void {
  const storage = getSessionStorage()
  if (!storage) return
  try {
    storage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // 忽略
  }
}

export function isAuthenticated(): boolean {
  return readSession() !== null
}

/**
 * 校验回跳目标：只接受站内 /admin 下的路径，防止被构造成外站跳转。
 * 拒绝 //evil.com（协议相对地址）与含反斜杠的路径。
 */
export function resolveRedirectTarget(raw: string | null, fallback = '/admin'): string {
  if (!raw) return fallback
  if (!raw.startsWith('/admin')) return fallback
  if (raw.startsWith('//')) return fallback
  if (raw.includes('\\')) return fallback
  return raw
}
