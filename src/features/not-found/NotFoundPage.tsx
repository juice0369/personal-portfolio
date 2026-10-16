import { Link } from 'react-router'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ButtonLink } from '../../components/ui/Button'

/** 404 页面：挂在 PublicLayout 之下，因此仍然保留导航与页脚 */
export function NotFoundPage() {
  useDocumentTitle('页面未找到')

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-card border border-ink-700 bg-ink-800 p-6 shadow-panel sm:p-8">
        <p className="text-xs font-medium tracking-[0.2em] text-champagne-400">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-parchment-100 sm:text-3xl">
          没有找到这个页面
        </h1>
        <p className="mt-3 max-w-[58ch] text-sm leading-7 text-parchment-300">
          地址可能输入有误，或对应的内容已被删除。可以从下面的入口继续浏览。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to="/">返回首页</ButtonLink>
          <ButtonLink to="/projects" variant="secondary">
            浏览项目
          </ButtonLink>
          <ButtonLink to="/blog" variant="secondary">
            阅读博客
          </ButtonLink>
        </div>
        <p className="mt-4 text-xs text-parchment-500">
          如果你是站点所有者，也可以直接
          <Link
            to="/admin"
            className="mx-1 rounded-control text-champagne-400 underline underline-offset-4 hover:text-champagne-200 focus-visible:focus-ring"
          >
            进入管理后台
          </Link>
          检查内容是否仍然存在。
        </p>
      </div>
    </div>
  )
}
