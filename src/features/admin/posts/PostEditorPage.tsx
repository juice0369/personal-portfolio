import { useMemo } from 'react'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router'
import { useContent } from '../../../content/useContent'
import {
  POST_CONTENT_MAX,
  isoDate,
  postStatusSchema,
  requiredText,
  slug as slugSchema,
  textList,
  type Post,
} from '../../../lib/schema'
import { generateSlug, uniqueSlug } from '../../../lib/slug'
import { createId } from '../../../lib/id'
import { nowTimestamp, todayIsoDate } from '../../../lib/date'
import { useConfirm } from '../../../hooks/confirm-context'
import { useForm } from '../../../hooks/useForm'
import { useToast } from '../../../hooks/toast-context'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { Button, ButtonLink } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { SelectField, TagListField, TextAreaField, TextField } from '../../../components/ui/Field'
import { PageHeader } from '../../../components/PageHeader'
import { MarkdownEditor } from './MarkdownEditor'

/**
 * 文章编辑器（F-18）。
 * 正文较长，因此文章编辑使用整页而不是抽屉 / 弹窗；
 * 校验规则与 postSchema 保持一致，包括"已发布文章正文不能为空"。
 */

const formSchema = z
  .object({
    title: requiredText('文章标题', 80),
    slug: z.union([slugSchema, z.literal('')]),
    summary: requiredText('文章摘要', 200),
    tags: textList('标签', 6, 20),
    publishedAt: isoDate,
    status: postStatusSchema,
    content: z.string().max(POST_CONTENT_MAX, `文章正文不能超过 ${POST_CONTENT_MAX} 个字符`),
  })
  .refine((value) => value.status !== 'published' || value.content.trim().length > 0, {
    message: '发布状态的文章正文不能为空',
    path: ['content'],
  })

type FormValues = z.infer<typeof formSchema>

const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿（前台不显示）' },
  { value: 'published', label: '已发布（前台可见）' },
]

function toFormValues(post: Post | null): FormValues {
  if (post === null) {
    return {
      title: '',
      slug: '',
      summary: '',
      tags: [],
      publishedAt: todayIsoDate(),
      status: 'draft',
      content: '',
    }
  }
  return {
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    tags: [...post.tags],
    publishedAt: post.publishedAt,
    status: post.status,
    content: post.content,
  }
}

/** 路由层：负责取出文章与"未找到"分支，表单本身由 PostEditorForm 承担 */
export function PostEditorPage({ mode }: { mode: 'create' | 'edit' }) {
  const params = useParams()
  const { state } = useContent()

  useDocumentTitle(mode === 'create' ? '新建文章' : '编辑文章')

  const existing = useMemo(
    () => (mode === 'edit' ? state.posts.find((post) => post.id === params.id) : null),
    [mode, params.id, state.posts],
  )

  if (mode === 'edit' && existing === undefined) {
    return (
      <EmptyState
        title="没有找到这篇文章"
        headingLevel="h1"
        description="它可能已经被删除。返回文章列表可以查看当前全部文章。"
        action={
          <ButtonLink to="/admin/posts" variant="secondary">
            返回文章列表
          </ButtonLink>
        }
      />
    )
  }

  return <PostEditorForm post={existing ?? null} />
}

function PostEditorForm({ post }: { post: Post | null }) {
  const { state, dispatch } = useContent()
  const { pushToast } = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()

  const initialValues = toFormValues(post)
  const takenSlugs = state.posts.filter((item) => item.id !== post?.id).map((item) => item.slug)

  const form = useForm<FormValues, FormValues>({
    schema: formSchema,
    initialValues,
    onSubmit: (values) => {
      const trimmed = values.slug.trim()
      const generated = trimmed.length === 0
      const finalSlug = generated ? uniqueSlug(generateSlug(values.title), takenSlugs) : trimmed

      if (takenSlugs.includes(finalSlug)) {
        form.setErrors({ slug: '该标识已被其它文章占用，请换一个标识' })
        return
      }

      if (post === null) {
        dispatch({
          type: 'addPost',
          post: {
            ...values,
            slug: finalSlug,
            id: createId(),
            updatedAt: nowTimestamp(),
          },
        })
        pushToast({
          level: 'success',
          message:
            values.status === 'published'
              ? '文章已发布，前台博客列表会立即显示'
              : '已保存为草稿，草稿不会出现在前台',
        })
      } else {
        dispatch({ type: 'updatePost', id: post.id, patch: { ...values, slug: finalSlug } })
        pushToast({
          level: 'success',
          message:
            values.status === 'published'
              ? '已保存并发布，前台会立即更新'
              : '已保存为草稿，前台不再显示这篇文章',
        })
      }

      navigate('/admin/posts')
    },
  })

  const dirty = JSON.stringify(form.values) !== JSON.stringify(initialValues)

  async function handleCancel() {
    if (dirty) {
      const confirmed = await confirm({
        title: '放弃未保存的修改？',
        description: '这篇文章还有未保存的修改，离开后这些修改会丢失。',
        confirmLabel: '放弃修改',
      })
      if (!confirmed) return
    }
    navigate('/admin/posts')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={post === null ? '新建文章' : '编辑文章'}
        description="正文使用 Markdown 编写，右侧预览会随输入更新。发布状态的文章才会出现在前台。"
        meta={post === null ? undefined : `最后修改：${post.updatedAt}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {post !== null && post.status === 'published' ? (
              <Link
                to={`/blog/${encodeURIComponent(post.slug)}`}
                className="inline-flex min-h-11 items-center rounded-control px-3 text-sm text-champagne-400 hover:text-champagne-200 focus-visible:focus-ring"
              >
                查看前台页面
              </Link>
            ) : null}
            <Button variant="secondary" size="sm" onClick={() => void handleCancel()}>
              返回文章列表
            </Button>
          </div>
        }
      />

      <form className="space-y-6" onSubmit={form.handleSubmit} noValidate>
        <Card as="section">
          <h2 className="text-base font-semibold text-parchment-100">文章信息</h2>
          <div className="mt-4 space-y-4">
            <TextField
              name="title"
              label="标题"
              value={form.values.title}
              error={form.errors.title}
              onChange={(value) => form.setValue('title', value)}
              onBlur={() => form.validateField('title')}
              required
              maxLength={80}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                name="slug"
                label="地址标识"
                value={form.values.slug}
                error={form.errors.slug}
                onChange={(value) => form.setValue('slug', value)}
                onBlur={() => form.validateField('slug')}
                hint="留空时自动由标题生成"
                placeholder="例如：my-first-post"
              />
              <TextField
                name="publishedAt"
                label="发布日期"
                type="date"
                value={form.values.publishedAt}
                error={form.errors.publishedAt}
                onChange={(value) => form.setValue('publishedAt', value)}
                onBlur={() => form.validateField('publishedAt')}
                required
              />
            </div>

            <TextAreaField
              name="summary"
              label="摘要"
              value={form.values.summary}
              error={form.errors.summary}
              onChange={(value) => form.setValue('summary', value)}
              onBlur={() => form.validateField('summary')}
              rows={3}
              hint="列表页与详情页顶部显示，最多 200 个字符"
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <TagListField
                name="tags"
                label="标签"
                value={form.values.tags}
                error={form.errors.tags}
                onChange={(value) => form.setValue('tags', value)}
                hint="最多 6 个，用逗号分隔；前台可据此筛选"
              />
              <SelectField
                name="status"
                label="状态"
                value={form.values.status}
                options={STATUS_OPTIONS}
                error={form.errors.status}
                onChange={(value) => form.setValue('status', value as FormValues['status'])}
                required
              />
            </div>
          </div>
        </Card>

        <Card as="section">
          <h2 className="text-base font-semibold text-parchment-100">正文</h2>
          <div className="mt-4">
            <MarkdownEditor
              value={form.values.content}
              error={form.errors.content}
              onChange={(value) => form.setValue('content', value)}
            />
          </div>
          {form.formError !== null ? (
            <p role="alert" className="mt-3 text-xs text-danger-400">
              {form.formError}
            </p>
          ) : null}
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? '正在保存…' : post === null ? '保存文章' : '保存修改'}
          </Button>
          <Button variant="secondary" onClick={() => void handleCancel()}>
            取消
          </Button>
          {dirty ? (
            <span className="text-xs text-champagne-400">有未保存的修改</span>
          ) : (
            <span className="text-xs text-parchment-500">当前内容已保存</span>
          )}
        </div>
      </form>
    </div>
  )
}
