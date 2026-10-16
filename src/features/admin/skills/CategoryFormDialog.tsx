import { z } from 'zod'
import { requiredText, type SkillCategory } from '../../../lib/schema'
import { useForm } from '../../../hooks/useForm'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/Field'
import { Modal } from '../../../components/ui/Modal'

const formSchema = z.object({ name: requiredText('分类名称', 20) })
type FormValues = z.infer<typeof formSchema>

/**
 * 技能分类的新增 / 重命名（F-16）。
 * 分类名不允许重复：同名会让前台分组出现歧义，因此这里显式拦截并给出字段级提示。
 */
export function CategoryFormDialog({
  category,
  takenNames,
  onClose,
  onSubmit,
}: {
  category: SkillCategory | null
  /** 已被其他分类占用的名称（不含当前编辑对象） */
  takenNames: readonly string[]
  onClose: () => void
  onSubmit: (name: string) => void
}) {
  const form = useForm<FormValues, FormValues>({
    schema: formSchema,
    initialValues: { name: category?.name ?? '' },
    onSubmit: (values) => {
      if (takenNames.includes(values.name)) {
        form.setErrors({ name: '该分类名称已存在，请换一个名称' })
        return
      }
      onSubmit(values.name)
    },
  })

  return (
    <Modal
      open
      title={category === null ? '新增技能分类' : '重命名技能分类'}
      description="分类用于在前台把技能分组展示，名称会直接出现在首页。"
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit} noValidate>
        <TextField
          name="name"
          label="分类名称"
          value={form.values.name}
          error={form.errors.name}
          onChange={(value) => form.setValue('name', value)}
          onBlur={() => form.validateField('name')}
          hint="最多 20 个字符，例如：前端、后端、工具"
          required
          maxLength={20}
        />

        <div className="flex flex-col-reverse gap-2 border-t border-ink-700 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={form.isSubmitting}>
            保存分类
          </Button>
        </div>
      </form>
    </Modal>
  )
}
