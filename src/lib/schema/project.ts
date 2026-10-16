import { z } from 'zod'
import {
  nullableHttpUrl,
  nullableYearMonth,
  optionalText,
  orderValue,
  requiredText,
  slug,
  textList,
  timestamp,
  yearMonth,
} from './primitives'

export const PROJECT_CONTENT_MAX = 4000

export const projectSchema = z
  .object({
    id: z.string().min(1),
    slug,
    title: requiredText('项目标题', 60),
    summary: requiredText('项目摘要', 160),
    role: optionalText('我的职责', 40),
    category: optionalText('项目分类', 20),
    startDate: yearMonth,
    endDate: nullableYearMonth,
    techStack: textList('技术标签', 12, 20),
    highlights: textList('成果要点', 5, 120),
    content: z.string().max(PROJECT_CONTENT_MAX, `正文不能超过 ${PROJECT_CONTENT_MAX} 个字符`),
    repoUrl: nullableHttpUrl,
    demoUrl: nullableHttpUrl,
    featured: z.boolean(),
    order: orderValue,
    updatedAt: timestamp,
  })
  .refine((value) => value.endDate === null || value.endDate >= value.startDate, {
    message: '结束时间不能早于开始时间',
    path: ['endDate'],
  })

export type Project = z.infer<typeof projectSchema>
