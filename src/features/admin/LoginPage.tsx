import { z } from 'zod'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { DEMO_CREDENTIALS } from '../../lib/constants'
import { requiredText } from '../../lib/schema'
import { isAuthenticated, resolveRedirectTarget, writeSession } from '../../lib/storage/auth-store'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useForm } from '../../hooks/useForm'
import { useToast } from '../../hooks/toast-context'
import { Starfield } from '../../components/Starfield'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/Field'

/**
 * 演示登录（F-13）。
 *
 * 这里是**课程演示**用的登录：凭证是源码中的公开常量，构建产物里任何人都能读到，
 * 因此它只负责把"能否看到后台页面"分开，不具备任何安全能力（PRD §11.1）。
 * 登录成功后的回跳地址只接受 /admin 开头的站内路径，避免被构造成外站跳转。
 */

const loginFormSchema = z.object({
  username: requiredText('账号', 40),
  password: requiredText('密码', 40),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pushToast } = useToast()
  const redirectTarget = resolveRedirectTarget(searchParams.get('redirect'))

  useDocumentTitle('管理登录')

  const form = useForm<LoginFormValues, LoginFormValues>({
    schema: loginFormSchema,
    initialValues: { username: '', password: '' },
    onSubmit: (values) => {
      const matched =
        values.username.trim() === DEMO_CREDENTIALS.username &&
        values.password === DEMO_CREDENTIALS.password

      if (!matched) {
        // 不指出是哪一项错误，避免给出过多提示
        form.setErrors({ password: '账号或密码不正确' })
        return
      }

      writeSession(DEMO_CREDENTIALS.username)
      pushToast({ level: 'success', message: '已登录，可以开始修改内容' })
      navigate(redirectTarget, { replace: true })
    },
  })

  if (isAuthenticated()) {
    return <Navigate to={redirectTarget} replace />
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Starfield />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-card border border-ink-700 bg-ink-800 p-6 shadow-panel sm:p-8">
          <p className="text-xs font-medium tracking-[0.2em] text-champagne-400">管理后台</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-parchment-100">登录</h1>

          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit} noValidate>
            <TextField
              name="username"
              label="账号"
              value={form.values.username}
              error={form.errors.username}
              onChange={(value) => form.setValue('username', value)}
              onBlur={() => form.validateField('username')}
              autoComplete="username"
              required
            />
            <TextField
              name="password"
              label="密码"
              type="password"
              value={form.values.password}
              error={form.errors.password}
              onChange={(value) => form.setValue('password', value)}
              onBlur={() => form.validateField('password')}
              autoComplete="current-password"
              required
            />

            {form.formError !== null ? (
              <p role="alert" className="text-xs leading-5 text-danger-400">
                {form.formError}
              </p>
            ) : null}

            <Button type="submit" block disabled={form.isSubmitting}>
              {form.isSubmitting ? '正在登录…' : '登录后台'}
            </Button>
          </form>

          <div className="mt-6 rounded-control border border-ink-700 bg-ink-900 px-3 py-2.5">
            <p className="text-xs text-parchment-500">演示账号（公开信息，可自由使用）</p>
            <p className="mt-1 text-sm text-parchment-100 tabular-nums">
              账号 {DEMO_CREDENTIALS.username} · 密码 {DEMO_CREDENTIALS.password}
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-parchment-500">
          <Link
            to="/"
            className="rounded-control text-champagne-400 underline underline-offset-4 hover:text-champagne-200 focus-visible:focus-ring"
          >
            返回前台首页
          </Link>
        </p>
      </div>
    </div>
  )
}
