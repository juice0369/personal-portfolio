import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { AppProviders } from './app/providers'
import { router } from './app/router'

/**
 * 应用入口：Providers（提示 + 二次确认 + 内容状态）包住路由。
 * 顺序上 ContentProvider 依赖 ToastProvider，因此必须位于其内部。
 */

const container = document.getElementById('root')

if (container === null) {
  throw new Error('未找到 #root 挂载点，请检查 index.html')
}

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
