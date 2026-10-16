import { z } from 'zod'
import { levelValue, optionalText, orderValue, requiredText } from './primitives'

export const skillCategorySchema = z.object({
  id: z.string().min(1),
  name: requiredText('分类名称', 20),
  order: orderValue,
})

export const skillSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1, '请选择技能分类'),
  name: requiredText('技能名称', 30),
  level: levelValue,
  description: optionalText('技能说明', 120),
  order: orderValue,
})

export type SkillCategory = z.infer<typeof skillCategorySchema>
export type Skill = z.infer<typeof skillSchema>
