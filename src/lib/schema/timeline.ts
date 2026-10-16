import { z } from 'zod'
import {
  nullableYearMonth,
  optionalText,
  orderValue,
  requiredText,
  textList,
  yearMonth,
} from './primitives'

export const TIMELINE_KINDS = ['education', 'experience'] as const
export const timelineKindSchema = z.enum(TIMELINE_KINDS)

export const timelineItemSchema = z
  .object({
    id: z.string().min(1),
    kind: timelineKindSchema,
    title: requiredText('机构名称', 60),
    role: optionalText('专业或职位', 40),
    startDate: yearMonth,
    endDate: nullableYearMonth,
    description: optionalText('经历描述', 400),
    tags: textList('标签', 8, 20),
    order: orderValue,
  })
  .refine((value) => value.endDate === null || value.endDate >= value.startDate, {
    message: '结束时间不能早于开始时间',
    path: ['endDate'],
  })

export type TimelineKind = z.infer<typeof timelineKindSchema>
export type TimelineItem = z.infer<typeof timelineItemSchema>
