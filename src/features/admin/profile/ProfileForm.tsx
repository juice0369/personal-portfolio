import { useMemo } from 'react'
import type { z } from 'zod'
import { useContent } from '../../../content/useContent'
import { SOCIAL_ICON_NAMES, profileSchema, type Profile } from '../../../lib/schema'
import { createId } from '../../../lib/id'
import { useForm } from '../../../hooks/useForm'
import { useToast } from '../../../hooks/toast-context'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { SelectField, TextAreaField, TextField } from '../../../components/ui/Field'
import { IconPlus, IconTrash } from '../../../components/icons'
import { AvatarUploader } from './AvatarUploader'

/**
 * 个人资料表单（F-15）。
 *
 * 校验直接复用 profileSchema（去掉由上传流程维护的头像与由系统维护的更新时间），
 * 因此表单约束、本地数据校验与导入校验三者永远一致（PRD §7.3）。
 */

const formSchema = profileSchema.omit({ avatarAssetId: true, updatedAt: true })
type FormValues = z.infer<typeof formSchema>

const ICON_LABELS: Record<(typeof SOCIAL_ICON_NAMES)[number], string> = {
  github: 'GitHub',
  mail: '邮箱',
  link: '个人网站',
  twitter: 'Twitter / X',
  zhihu: '知乎',
  juejin: '掘金',
  wechat: '微信',
  linkedin: 'LinkedIn',
}

const ICON_OPTIONS = SOCIAL_ICON_NAMES.map((name) => ({ value: name, label: ICON_LABELS[name] }))

function toFormValues(profile: Profile): FormValues {
  return {
    name: profile.name,
    headline: profile.headline,
    bio: profile.bio,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    socials: profile.socials.map((social) => ({ ...social })),
  }
}

export function ProfileForm() {
  const { state, dispatch } = useContent()
  const { pushToast } = useToast()
  const { profile } = state

  const saved = useMemo(() => toFormValues(profile), [profile])

  const form = useForm<FormValues, FormValues>({
    schema: formSchema,
    initialValues: saved,
    onSubmit: (values) => {
      dispatch({ type: 'patchProfile', patch: values })
      pushToast({ level: 'success', message: '个人资料已保存，前台会立即更新' })
    },
  })

  const dirty = JSON.stringify(form.values) !== JSON.stringify(saved)
  const socials = form.values.socials

  function updateSocial(index: number, patch: Partial<FormValues['socials'][number]>) {
    form.setValue(
      'socials',
      socials.map((social, current) => (current === index ? { ...social, ...patch } : social)),
    )
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit} noValidate>
      <AvatarUploader />

      <Card as="section">
        <h2 className="text-base font-semibold text-parchment-100">基本资料</h2>
        <p className="mt-1 text-xs leading-5 text-parchment-500">
          姓名、职业方向与个人简介会出现在首页首屏；简介换行会按段落渲染。
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField
            name="name"
            label="姓名"
            value={form.values.name}
            error={form.errors.name}
            onChange={(value) => form.setValue('name', value)}
            onBlur={() => form.validateField('name')}
            required
            maxLength={40}
          />
          <TextField
            name="headline"
            label="职业方向"
            value={form.values.headline}
            error={form.errors.headline}
            onChange={(value) => form.setValue('headline', value)}
            onBlur={() => form.validateField('headline')}
            hint="例如：前端开发工程师 · 关注工程化与交互体验"
            required
            maxLength={60}
          />
        </div>

        <div className="mt-4">
          <TextAreaField
            name="bio"
            label="个人简介"
            value={form.values.bio}
            error={form.errors.bio}
            onChange={(value) => form.setValue('bio', value)}
            onBlur={() => form.validateField('bio')}
            rows={5}
            hint="最多 600 个字符。空行分隔的段落会在前台分开显示。"
            required
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField
            name="email"
            label="邮箱"
            type="email"
            value={form.values.email}
            error={form.errors.email}
            onChange={(value) => form.setValue('email', value)}
            onBlur={() => form.validateField('email')}
            required
          />
          <TextField
            name="phone"
            label="手机号"
            type="tel"
            value={form.values.phone}
            error={form.errors.phone}
            onChange={(value) => form.setValue('phone', value)}
            onBlur={() => form.validateField('phone')}
            hint="可留空；留空时前台不显示这一项"
          />
          <TextField
            name="location"
            label="所在城市"
            value={form.values.location}
            error={form.errors.location}
            onChange={(value) => form.setValue('location', value)}
            onBlur={() => form.validateField('location')}
            hint="可留空"
            maxLength={40}
          />
        </div>
      </Card>

      <Card as="section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-parchment-100">社交链接</h2>
            <p className="mt-1 text-xs leading-5 text-parchment-500">
              最多 6 个。地址只接受 http 或 https 链接，前台点击后在新标签页打开。
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={socials.length >= 6}
            onClick={() =>
              form.setValue('socials', [
                ...socials,
                { id: createId(), label: '新链接', url: 'https://', icon: 'link' },
              ])
            }
          >
            <IconPlus />
            添加链接
          </Button>
        </div>

        {form.errors.socials ? (
          <p role="alert" className="mt-3 text-xs text-danger-400">
            {form.errors.socials}
          </p>
        ) : null}

        {socials.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-parchment-300">
            还没有社交链接。点击「添加链接」补充 GitHub、知乎等入口。
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {socials.map((social, index) => (
              <li
                key={social.id}
                className="grid gap-4 rounded-control border border-ink-700 bg-ink-900 p-4 sm:grid-cols-[1fr_2fr_1fr_auto] sm:items-start"
              >
                <TextField
                  name={`socials.${index}.label`}
                  label="名称"
                  value={social.label}
                  error={form.errors[`socials.${index}.label`]}
                  onChange={(value) => updateSocial(index, { label: value })}
                  maxLength={20}
                />
                <TextField
                  name={`socials.${index}.url`}
                  label="链接地址"
                  type="url"
                  value={social.url}
                  error={form.errors[`socials.${index}.url`]}
                  onChange={(value) => updateSocial(index, { url: value })}
                  placeholder="https://example.com"
                />
                <SelectField
                  name={`socials.${index}.icon`}
                  label="图标"
                  value={social.icon}
                  options={ICON_OPTIONS}
                  error={form.errors[`socials.${index}.icon`]}
                  onChange={(value) =>
                    updateSocial(index, { icon: value as FormValues['socials'][number]['icon'] })
                  }
                />
                <div className="sm:pt-7">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`删除链接 ${social.label}`}
                    onClick={() =>
                      form.setValue(
                        'socials',
                        socials.filter((_, current) => current !== index),
                      )
                    }
                  >
                    <IconTrash />
                    删除
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? '正在保存…' : '保存个人资料'}
        </Button>
        <Button
          variant="secondary"
          disabled={!dirty}
          onClick={() => form.reset(toFormValues(profile))}
        >
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
