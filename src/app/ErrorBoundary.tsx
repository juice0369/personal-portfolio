import { Link, useRouteError } from 'react-router'
import { useContent } from '../content/useContent'
import { useToast } from '../hooks/toast-context'
import { Button, ButtonLink } from '../components/ui/Button'

/**
 * 渲染错误兜底（TECH_DESIGN §13）。
 *
 * 使用 React Router 的 ErrorBoundary 路由属性挂载，因此不需要为捕获错误编写类组件
 * （AGENTS.md §4.2 要求全部使用函数组件）。
 * 提供两个出口：返回首页，以及清除本地数据后回到内置数据（应对本地数据导致的渲染异常）。
 */
export function ErrorBoundary() {
  const error = useRouteError()
  const { resetToSeed } = useContent()
  const { pushToast } = useToast()

  const detail =
    error instanceof Error ? error.message : typeof error === 'string' ? error : '未知错误'

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-card border border-ink-700 bg-ink-800 p-6 shadow-panel sm:p-8">
        <p className="text-xs font-medium tracking-[0.2em] text-danger-400">页面出错了</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-parchment-100">
          这个页面没能正常渲染
        </h1>
        <p className="mt-3 text-sm leading-7 text-parchment-300">
          可以先返回首页重新进入。如果反复出现，可能是保存在浏览器本地的数据不符合当前格式，
          可以选择清除本地数据并恢复内置默认数据（该操作不可撤销，请在后台先导出一份备份）。
        </p>
        <p className="mt-3 rounded-control border border-ink-700 bg-ink-900 px-3 py-2 text-xs break-words text-parchment-500">
          {detail}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to="/">返回首页</ButtonLink>
          <Button
            variant="danger"
            onClick={async () => {
              await resetToSeed()
              pushToast({ level: 'info', message: '已清除本地数据，站点恢复为内置默认内容' })
            }}
          >
            重置本地数据
          </Button>
          <Link
            to="/admin"
            className="inline-flex min-h-11 items-center rounded-control px-3 text-sm text-parchment-300 hover:text-parchment-100 focus-visible:focus-ring"
          >
            进入管理后台
          </Link>
        </div>
      </div>
    </div>
  )
}
