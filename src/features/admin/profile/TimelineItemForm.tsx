import { z } from 'zod'
import type { TimelineItem } from '../../../lib/schema'
import {
  optionalText,
  requiredText,
  textList,
  timelineKindSchema,
  yearMonth,
} from '../../../lib/schema'
import { useForm } from '../../../hooks/useForm'
import { Button } from '../../../components/ui/Button'
import { CheckboxField } from '../../../components/ui/Checkbox'
import { SelectField, TagListField, TextAreaField, TextField } from '../../../components/ui/Field'
import { Modal } from '../../../components/ui/Modal'

/**
 * 经历编辑表单的取值。
 * "是否至今"用独立的布尔值表示，避免用空字符串同时承载"未填写"与"至今"两种含义。
 */
const formSchema = z
  .object({
    kind: timelineKindSchema,
    title: requiredText('机构名称', 60),
    role: optionalText('专业或职位', 40),
    startDate: yearMonth,
    ongoing: z.boolean(),
    endDate: z.union([yearMonth, z.literal('')]),
    description: optionalText('经历描述', 400),
    tags: textList('标签', 8, 20),
  })
  .refine((value) => value.ongoing || value.endDate !== '', {
    message: '请填写结束时间，或勾选「至今」',
    path: ['endDate'],
  })
  .refine((value) => value.ongoing || value.endDate >= value.startDate, {
    message: '结束时间不能早于开始时间',
    path: ['endDate'],
  })

type FormValues = z.infer<typeof formSchema>

export type TimelineDraft = Omit<TimelineItem, 'id' | 'order'>

const KIND_OPTIONS = [
  { value: 'education', label: '教育' },
  { value: 'experience', label: '实践经历' },
]

function toFormValues(item: TimelineItem | null): FormValues {
  if (item === null) {
    return {
      kind: 'experience',
      title: '',
      role: '',
      startDate: '',
      ongoing: true,
      endDate: '',
      description: '',
      tags: [],
    }
  }
  return {
    kind: item.kind,
    title: item.title,
    role: item.role,
    startDate: item.startDate,
    ongoing: item.endDate === null,
    endDate: item.endDate ?? '',
    description: item.description,
    tags: [...item.tags],
  }
}

/**
 * 经历条目的新增 / 编辑表单（F-15）。
 * 由父组件在打开时挂载、关闭时卸载，因此每次打开都是干净的初始值。
 */
export function TimelineItemForm({
  item,
  onClose,
  onSubmit,
}: {
  item: TimelineItem | null
  onClose: () => void
  onSubmit: (draft: TimelineDraft) => void
}) {
  const form = useForm<FormValues, FormValues>({
    schema: formSchema,
    initialValues: toFormValues(item),
    onSubmit: (values) => {
      onSubmit({
        kind: values.kind,
        title: values.title,
        role: values.role,
        startDate: values.startDate,
        endDate: values.ongoing ? null : values.endDate,
        description: values.description,
        tags: values.tags,
      })
    },
  })

  const ongoing = form.values.ongoing

  return (
    <Modal
      open
      title={item === null ? '新增经历' : '编辑经历'}
      description="教育与实践经历都会出现在首页的时间线区块，按开始时间倒序排列。"
      onClose={onClose}
      size="lg"
    >
      <form className="space-y-4" onSubmit={form.handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="kind"
            label="类型"
            value={form.values.kind}
            options={KIND_OPTIONS}
            error={form.errors.kind}
            onChange={(value) => form.setValue('kind', value as FormValues['kind'])}
            required
          />
          <TextField
            name="title"
            label="学校 / 机构名称"
            value={form.values.title}
            error={form.errors.title}
            onChange={(value) => form.setValue('title', value)}
            onBlur={() => form.validateField('title')}
            required
            maxLength={60}
          />
        </div>

        <TextField
          name="role"
          label="专业 / 职位"
          value={form.values.role}
          error={form.errors.role}
          onChange={(value) => form.setValue('role', value)}
          onBlur={() => form.validateField('role')}
          hint="可留空"
          maxLength={40}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="startDate"
            label="开始时间"
            type="month"
            value={form.values.startDate}
            error={form.errors.startDate}
            onChange={(value) => form.setValue('startDate', value)}
            onBlur={() => form.validateField('startDate')}
            hint="格式为年-月"
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
            hint="勾选「至今」时无需填写"
            disabled={ongoing}
          />
        </div>

        <CheckboxField
          name="ongoing"
          label="至今（仍在进行）"
          hint="勾选后前台显示为「2024.09 — 至今」"
          checked={ongoing}
          onChange={(checked) => form.setValue('ongoing', checked)}
        />

        <TextAreaField
          name="description"
          label="经历描述"
          value={form.values.description}
          error={form.errors.description}
          onChange={(value) => form.setValue('description', value)}
          onBlur={() => form.validateField('description')}
          rows={4}
          hint="可留空。最多 400 个字符：写清做了什么、得到什么结果"
        />

        <TagListField
          name="tags"
          label="标签"
          value={form.values.tags}
          error={form.errors.tags}
          onChange={(value) => form.setValue('tags', value)}
          hint="最多 8 个，用逗号分隔"
        />

        <div className="flex flex-col-reverse gap-2 border-t border-ink-700 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? '正在保存…' : '保存经历'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
