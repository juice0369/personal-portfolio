import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router'
import { readSession, writeSession } from '../../lib/storage/auth-store'
import { RequireAuth } from './RequireAuth'

/** 用于读取回跳参数的探针，代替真实登录页 */
function LoginProbe() {
  const [params] = useSearchParams()
  return <p>回跳地址：{params.get('redirect') ?? '（无）'}</p>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/login" element={<LoginProbe />} />
        <Route
          path="/admin/projects"
          element={
            <RequireAuth>
              <h1>项目管理</h1>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth（F-13 / AC-F13）', () => {
  it('无会话时重定向到登录页，并把当前路径放进 redirect 参数', () => {
    renderAt('/admin/projects')

    expect(screen.queryByRole('heading', { name: '项目管理' })).not.toBeInTheDocument()
    expect(screen.getByText('回跳地址：/admin/projects')).toBeInTheDocument()
  })

  it('有会话时直接渲染受保护内容', () => {
    writeSession('demo')

    renderAt('/admin/projects')

    expect(screen.getByRole('heading', { name: '项目管理' })).toBeInTheDocument()
    expect(screen.queryByText(/回跳地址/)).not.toBeInTheDocument()
  })

  it('会话被清除后再次访问又会被拦下', () => {
    writeSession('demo')
    expect(readSession()).not.toBeNull()

    window.sessionStorage.clear()
    renderAt('/admin/projects')

    expect(screen.getByText('回跳地址：/admin/projects')).toBeInTheDocument()
  })
})
