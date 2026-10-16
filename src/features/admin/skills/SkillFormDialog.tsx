import { z } from 'zod'
import { optionalText, requiredText, type Skill, type SkillCategory } from '../../../lib/schema'
import { useForm } from '../../../hooks/useForm'
import { Button } from '../../../components/ui/Button'
import { SelectField, TextAreaField, TextField } from '../../../components/ui/Field'
import { Modal } from '../../../components/ui/Modal'

/** 熟练度用下拉选择，取值以字符串承载，提交时再转成数字 */
const LEVEL_VALUES = ['1', '2', '3', '4', '5'] as const

const formSchema = z.object({
  categoryId: z.string().min(1, '请选择技能分类'),
  name: requiredText('技能名称', 30),
  level: z
    .string()
    .refine((value) => LEVEL_VALUES.includes(value as (typeof LEVEL_VALUES)[number]), {
      message: '请选择 1 到 5 之间的熟练度',
    }),
  description: optionalText('技能说明', 120),
})

type FormValues = z.infer<typeof formSchema>

export type SkillDraft = {
  categoryId: string
  name: string
  level: number
  description: string
}

const LEVEL_OPTIONS = [
  { value: '1', label: '1 · 了解' },
  { value: '2', label: '2 · 入门' },
  { value: '3', label: '3 · 熟练' },
  { value: '4', label: '4 · 深入' },
  { value: '5', label: '5 · 精通' },
]

/** 技能的新增 / 编辑（F-16）；名称不允许与其它技能重复 */
export function SkillFormDialog({
  skill,
  categories,
  takenNames,
  defaultCategoryId,
  onClose,
  onSubmit,
}: {
  skill: Skill | null
  categories: readonly SkillCategory[]
  /** 已被其他技能占用的名称（不含当前编辑对象） */
  takenNames: readonly string[]
  defaultCategoryId: string
  onClose: () => void
  onSubmit: (draft: SkillDraft) => void
}) {
  const form = useForm<FormValues, FormValues>({
    schema: formSchema,
    initialValues: {
      categoryId: skill?.categoryId ?? defaultCategoryId,
      name: skill?.name ?? '',
      level: String(skill?.level ?? 3),
      description: skill?.description ?? '',
    },
    onSubmit: (values) => {
      if (takenNames.includes(values.name)) {
        form.setErrors({ name: '该技能名称已存在，请换一个名称' })
        return
      }
      onSubmit({
        categoryId: values.categoryId,
        name: values.name,
        level: Number(values.level),
        description: values.description,
      })
    },
  })

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))

  return (
    <Modal
      open
      title={skill === null ? '新增技能' : '编辑技能'}
      description="熟练度为 1–5 级，前台以 5 格进度条展示。"
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit} noValidate>
        <SelectField
          name="categoryId"
          label="所属分类"
          value={form.values.categoryId}
          options={categoryOptions}
          error={form.errors.categoryId}
          onChange={(value) => form.setValue('categoryId', value)}
          required
        />

        <TextField
          name="name"
          label="技能名称"
          value={form.values.name}
          error={form.errors.name}
          onChange={(value) => form.setValue('name', value)}
          onBlur={() => form.validateField('name')}
          hint="最多 30 个字符，例如：TypeScript"
          required
          maxLength={30}
        />

        <SelectField
          name="level"
          label="熟练度"
          value={form.values.level}
          options={LEVEL_OPTIONS}
          error={form.errors.level}
          onChange={(value) => form.setValue('level', value)}
          required
        />

        <TextAreaField
          name="description"
          label="技能说明"
          value={form.values.description}
          error={form.errors.description}
          onChange={(value) => form.setValue('description', value)}
          onBlur={() => form.validateField('description')}
          rows={3}
          hint="可留空，最多 120 个字符"
        />

        <div className="flex flex-col-reverse gap-2 border-t border-ink-700 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={form.isSubmitting}>
            保存技能
          </Button>
        </div>
      </form>
    </Modal>
  )
}
