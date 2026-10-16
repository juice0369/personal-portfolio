import { describe, expect, it } from 'vitest'
import { AUTH_STORAGE_KEY } from '../constants'
import {
  clearSession,
  isAuthenticated,
  readSession,
  resolveRedirectTarget,
  writeSession,
} from './auth-store'

describe('会话读写', () => {
  it('未登录时读取为 null', () => {
    expect(readSession()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it('写入后可以读回，登出后清除', () => {
    writeSession('demo')
    expect(isAuthenticated()).toBe(true)
    expect(readSession()?.user).toBe('demo')

    clearSession()
    expect(readSession()).toBeNull()
  })

  it('存储内容被破坏时视为未登录，不抛出异常', () => {
    window.sessionStorage.setItem(AUTH_STORAGE_KEY, '{ 坏掉的 JSON')
    expect(readSession()).toBeNull()

    window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: 123 }))
    expect(readSession()).toBeNull()
  })
})

describe('resolveRedirectTarget', () => {
  it('没有 redirect 参数时回退到 /admin', () => {
    expect(resolveRedirectTarget(null)).toBe('/admin')
    expect(resolveRedirectTarget('')).toBe('/admin')
  })

  it('接受 /admin 下的站内路径（含查询参数）', () => {
    expect(resolveRedirectTarget('/admin/projects')).toBe('/admin/projects')
    expect(resolveRedirectTarget('/admin/posts?page=2')).toBe('/admin/posts?page=2')
  })

  it('拒绝普通站内路径，避免跳出后台范围', () => {
    expect(resolveRedirectTarget('/projects')).toBe('/admin')
  })

  it('拒绝外站地址与协议相对地址', () => {
    expect(resolveRedirectTarget('https://evil.example.com')).toBe('/admin')
    expect(resolveRedirectTarget('//evil.example.com')).toBe('/admin')
    expect(resolveRedirectTarget('/\\evil.example.com')).toBe('/admin')
  })

  it('可以自定义回退目标', () => {
    expect(resolveRedirectTarget('https://evil.example.com', '/admin/login')).toBe('/admin/login')
  })
})
