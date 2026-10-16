import { z } from 'zod'
import {
  PROJECT_CONTENT_MAX,
  httpUrl,
  optionalText,
  requiredText,
  slug as slugSchema,
  textList,
  yearMonth,
  type Project,
} from '../../../lib/schema'
import { generateSlug, uniqueSlug } from '../../../lib/slug'
import { useConfirm } from '../../../hooks/confirm-context'
import { useForm } from '../../../hooks/useForm'
import { Button } from '../../../components/ui/Button'
import { CheckboxField } from '../../../components/ui/Checkbox'
import { Drawer } from '../../../components/ui/Drawer'
import { TagListField, TextAreaField, TextField } from '../../../components/ui/Field'

/**
 * 项目编辑抽屉（F-17）。
 * 字段较多，因此使用右侧抽屉；关闭前若有未保存修改会先二次确认，避免误丢内容（AC-F17）。
 */

const formSchema = z
  .object({
    slug: z.union([slugSchema, z.literal('')]),
    title: requiredText('项目标题', 60),
    summary: requiredText('项目摘要', 160),
    role: optionalText('我的职责', 40),
    category: optionalText('项目分类', 20),
    startDate: yearMonth,
    ongoing: z.boolean(),
    endDate: z.union([yearMonth, z.literal('')]),
    techStack: textList('技术标签', 12, 20),
    highlights: textList('成果要点', 5, 120),
    content: z.string().max(PROJECT_CONTENT_MAX, `项目正文不能超过 ${PROJECT_CONTENT_MAX} 个字符`),
    repoUrl: z.union([httpUrl, z.literal('')]),
    demoUrl: z.union([httpUrl, z.literal('')]),
    featured: z.boolean(),
  })
  .refine((value) => value.ongoing || value.endDate !== '', {
    message: '请填写结束时间，或勾选「进行中」',
    path: ['endDate'],
  })
  .refine((value) => value.ongoing || value.endDate >= value.startDate, {
    message: '结束时间不能早于开始时间',
    path: ['endDate'],
  })

type FormValues = z.infer<typeof formSchema>

export type ProjectDraft = Omit<Project, 'id' | 'order' | 'updatedAt'>

function toFormValues(project: Project | null): FormValues {
  if (project === null) {
    return {
      slug: '',
      title: '',
      summary: '',
      role: '',
      category: '',
      startDate: '',
      ongoing: true,
      endDate: '',
      techStack: [],
      highlights: [],
      content: '',
      repoUrl: '',
      demoUrl: '',
      featured: false,
    }
  }
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    role: project.role,
    category: project.category,
    startDate: project.startDate,
    ongoing: project.endDate === null,
    endDate: project.endDate ?? '',
    techStack: [...project.techStack],
    highlights: [...project.highlights],
    content: project.content,
    repoUrl: project.repoUrl ?? '',
    demoUrl: project.demoUrl ?? '',
    featured: project.featured,
  }
}

export function ProjectFormDrawer({
  project,
  takenSlugs,
  onClose,
  onSubmit,
}: {
  project: Project | null
  /** 已被其它项目占用的标识（不含当前编辑对象） */
  takenSlugs: readonly string[]
  onClose: () => void
  onSubmit: (draft: ProjectDraft, meta: { slugGenerated: boolean }) => void
}) {
  const confirm = useConfirm()
  const initialValues = toFormValues(project)

  const form = useForm<FormValues, FormValues>({
    schema: formSchema,
    initialValues,
    onSubmit: (values) => {
      const trimmed = values.slug.trim()
      const generated = trimmed.length === 0
      const finalSlug = generated ? uniqueSlug(generateSlug(values.title), takenSlugs) : trimmed

      if (takenSlugs.includes(finalSlug)) {
        form.setErrors({ slug: '该标识已被其它项目占用，请换一个标识' })
        return
      }

      onSubmit(
        {
          slug: finalSlug,
          title: values.title,
          summary: values.summary,
          role: values.role,
          category: values.category,
          startDate: values.startDate,
          endDate: values.ongoing ? null : values.endDate,
          techStack: values.techStack,
          highlights: values.highlights,
          content: values.content,
          repoUrl: values.repoUrl === '' ? null : values.repoUrl,
          demoUrl: values.demoUrl === '' ? null : values.demoUrl,
          featured: values.featured,
        },
        { slugGenerated: generated },
      )
    },
  })

  const dirty = JSON.stringify(form.values) !== JSON.stringify(initialValues)

  async function handleClose() {
    if (dirty) {
      const confirmed = await confirm({
        title: '放弃未保存的修改？',
        description: '这个项目还有未保存的修改，关闭后这些修改会丢失。',
        confirmLabel: '放弃修改',
      })
      if (!confirmed) return
    }
    onClose()
  }

  return (
    <Drawer
      open
      title={project === null ? '新增项目' : '编辑项目'}
      description="首页只展示勾选「首页精选」的项目，最多 3 个。"
      onClose={() => void handleClose()}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit} noValidate>
        <TextField
          name="title"
          label="项目标题"
          value={form.values.title}
          error={form.errors.title}
          onChange={(value) => form.setValue('title', value)}
          onBlur={() => form.validateField('title')}
          required
          maxLength={60}
        />

        <TextField
          name="slug"
          label="地址标识"
          value={form.values.slug}
          error={form.errors.slug}
          onChange={(value) => form.setValue('slug', value)}
          onBlur={() => form.validateField('slug')}
          hint="留空时自动由标题生成。详情页地址为 /projects/<标识>"
          placeholder="例如：campus-map"
        />

        <TextAreaField
          name="summary"
          label="项目摘要"
          value={form.values.summary}
          error={form.errors.summary}
          onChange={(value) => form.setValue('summary', value)}
          onBlur={() => form.validateField('summary')}
          rows={3}
          hint="列表卡片与详情页顶部使用，最多 160 个字符"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="role"
            label="我的职责"
            value={form.values.role}
            error={form.errors.role}
            onChange={(value) => form.setValue('role', value)}
            onBlur={() => form.validateField('role')}
            hint="可留空"
            maxLength={40}
          />
          <TextField
            name="category"
            label="项目分类"
            value={form.values.category}
            error={form.errors.category}
            onChange={(value) => form.setValue('category', value)}
            onBlur={() => form.validateField('category')}
            hint="用于项目列表页筛选，可留空"
            maxLength={20}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="startDate"
            label="开始时间"
            type="month"
            value={form.values.startDate}
            error={form.errors.startDate}
            onChange={(value) => form.setValue('startDate', value)}
            onBlur={() => form.validateField('startDate')}
            required
          />
          <TextField
            name="endDate"
            label="结束时间"
            type="month"
            value={form.values.endDate}
            error={form.errors.endDate}
            onChange={(value) => form.setValue('endDate', value)}
            onBlur={() => form.validateField('endDate')}
            disabled={form.values.ongoing}
            hint="勾选「进行中」时无需填写"
          />
        </div>

        <CheckboxField
          name="ongoing"
          label="进行中"
          hint="前台显示为「2025.03 — 进行中」"
          checked={form.values.ongoing}
          onChange={(checked) => form.setValue('ongoing', checked)}
        />

        <TagListField
          name="techStack"
          label="技术栈"
          value={form.values.techStack}
          error={form.errors.techStack}
          onChange={(value) => form.setValue('techStack', value)}
          hint="最多 12 项，用逗号分隔"
        />

        <TagListField
          name="highlights"
          label="成果要点"
          value={form.values.highlights}
          error={form.errors.highlights}
          onChange={(value) => form.setValue('highlights', value)}
          hint="可留空，最多 5 条，用逗号分隔"
        />

        <TextAreaField
          name="content"
          label="项目正文"
          value={form.values.content}
          error={form.errors.content}
          onChange={(value) => form.setValue('content', value)}
          onBlur={() => form.validateField('content')}
          rows={8}
          hint={`支持 Markdown（标题、列表、代码块、表格），最多 ${PROJECT_CONTENT_MAX} 个字符`}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="repoUrl"
            label="代码仓库地址"
            type="url"
            value={form.values.repoUrl}
            error={form.errors.repoUrl}
            onChange={(value) => form.setValue('repoUrl', value)}
            onBlur={() => form.validateField('repoUrl')}
            hint="可留空，仅支持 http / https"
            placeholder="https://github.com/example/repo"
          />
          <TextField
            name="demoUrl"
            label="在线演示地址"
            type="url"
            value={form.values.demoUrl}
            error={form.errors.demoUrl}
            onChange={(value) => form.setValue('demoUrl', value)}
            onBlur={() => form.validateField('demoUrl')}
            hint="可留空，仅支持 http / https"
            placeholder="https://example.com/demo"
          />
        </div>

        <CheckboxField
          name="featured"
          label="首页精选"
          hint="勾选后该项目会出现在首页「精选项目」区块"
          checked={form.values.featured}
          onChange={(checked) => form.setValue('featured', checked)}
        />

        <div className="flex flex-col-reverse gap-2 border-t border-ink-700 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => void handleClose()}>
            取消
          </Button>
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? '正在保存…' : '保存项目'}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
