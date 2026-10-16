import { useMemo } from 'react'
import { z } from 'zod'
import { useContent } from '../../../content/useContent'
import { MAX_POSTS_PER_PAGE, MIN_POSTS_PER_PAGE } from '../../../lib/constants'
import { optionalText, requiredText, type SiteSettings } from '../../../lib/schema'
import { useForm } from '../../../hooks/useForm'
import { useToast } from '../../../hooks/toast-context'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CheckboxField } from '../../../components/ui/Checkbox'
import { TextAreaField, TextField } from '../../../components/ui/Field'

/**
 * 站点设置表单（F-19）。
 * 每页条数在表单里以字符串承载（输入框天然是字符串），提交时再转成数字，
 * 校验范围直接取常量，与 schema 中的约束保持一致。
 */
const formSchema = z.object({
  siteTitle: requiredText('站点标题', 60),
  siteDescription: optionalText('站点描述', 160),
  footerText: optionalText('页脚文案', 100),
  starfieldEnabled: z.boolean(),
  postsPerPage: z
    .string()
    .regex(/^\d+$/, `每页条数需为 ${MIN_POSTS_PER_PAGE} 到 ${MAX_POSTS_PER_PAGE} 之间的整数`)
    .refine(
      (value) => Number(value) >= MIN_POSTS_PER_PAGE && Number(value) <= MAX_POSTS_PER_PAGE,
      `每页条数需在 ${MIN_POSTS_PER_PAGE} 到 ${MAX_POSTS_PER_PAGE} 之间`,
    ),
})

type FormValues = z.infer<typeof formSchema>

function toFormValues(settings: SiteSettings): FormValues {
  return {
    siteTitle: settings.siteTitle,
    siteDescription: settings.siteDescription,
    footerText: settings.footerText,
    starfieldEnabled: settings.starfieldEnabled,
    postsPerPage: String(settings.postsPerPage),
  }
}

export function SiteSettingsForm() {
  const { state, dispatch } = useContent()
  const { pushToast } = useToast()

  const saved = useMemo(() => toFormValues(state.settings), [state.settings])

  const form = useForm<FormValues, FormValues>({
    schema: formSchema,
    initialValues: saved,
    onSubmit: (values) => {
      dispatch({
        type: 'patchSettings',
        patch: { ...values, postsPerPage: Number(values.postsPerPage) },
      })
      pushToast({ level: 'success', message: '站点设置已保存，前台会立即更新' })
    },
  })

  const dirty = JSON.stringify(form.values) !== JSON.stringify(saved)

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit} noValidate>
      <Card as="section">
        <h2 className="text-base font-semibold text-parchment-100">站点信息</h2>
        <p className="mt-1 text-xs leading-5 text-parchment-500">
          站点标题会出现在浏览器标签页、导航栏与页脚。
        </p>

        <div className="mt-4 space-y-4">
          <TextField
            name="siteTitle"
            label="站点标题"
            value={form.values.siteTitle}
            error={form.errors.siteTitle}
            onChange={(value) => form.setValue('siteTitle', value)}
            onBlur={() => form.validateField('siteTitle')}
            required
            maxLength={60}
          />
          <TextAreaField
            name="siteDescription"
            label="站点描述"
            value={form.values.siteDescription}
            error={form.errors.siteDescription}
            onChange={(value) => form.setValue('siteDescription', value)}
            onBlur={() => form.validateField('siteDescription')}
            rows={2}
            hint="用于页面描述，最多 160 个字符"
          />
          <TextAreaField
            name="footerText"
            label="页脚文案"
            value={form.values.footerText}
            error={form.errors.footerText}
            onChange={(value) => form.setValue('footerText', value)}
            onBlur={() => form.validateField('footerText')}
            rows={2}
            hint="显示在页脚版权行右侧，最多 100 个字符"
          />
        </div>
      </Card>

      <Card as="section">
        <h2 className="text-base font-semibold text-parchment-100">展示与列表</h2>

        <div className="mt-4 space-y-4">
          <CheckboxField
            name="starfieldEnabled"
            label="启用星空背景"
            hint="纯 CSS 实现，不接收鼠标事件。开启「减少动态效果」时自动停止呼吸动画。"
            checked={form.values.starfieldEnabled}
            onChange={(checked) => form.setValue('starfieldEnabled', checked)}
          />

          <TextField
            name="postsPerPage"
            label="博客每页条数"
            type="number"
            value={form.values.postsPerPage}
            error={form.errors.postsPerPage}
            onChange={(value) => form.setValue('postsPerPage', value)}
            onBlur={() => form.validateField('postsPerPage')}
            hint={`允许范围 ${MIN_POSTS_PER_PAGE} 到 ${MAX_POSTS_PER_PAGE}，默认 6`}
            required
          />
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? '正在保存…' : '保存站点设置'}
        </Button>
        <Button variant="secondary" disabled={!dirty} onClick={() => form.reset(saved)}>
          放弃修改
        </Button>
        {dirty ? (
          <span className="text-xs text-champagne-400">有未保存的修改</span>
        ) : (
          <span className="text-xs text-parchment-500">当前内容已保存</span>
        )}
      </div>
    </form>
  )
}
