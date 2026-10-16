import { z } from 'zod'
import { isoDate, requiredText, slug, textList, timestamp } from './primitives'

export const POST_STATUSES = ['draft', 'published'] as const
export const postStatusSchema = z.enum(POST_STATUSES)

export const POST_CONTENT_MAX = 20000

export const postSchema = z
  .object({
    id: z.string().min(1),
    slug,
    title: requiredText('文章标题', 80),
    summary: requiredText('文章摘要', 200),
    tags: textList('标签', 6, 20),
    publishedAt: isoDate,
    updatedAt: timestamp,
    status: postStatusSchema,
    content: z.string().max(POST_CONTENT_MAX, `正文不能超过 ${POST_CONTENT_MAX} 个字符`),
  })
  .superRefine((value, ctx) => {
    if (value.status === 'published' && value.content.trim().length === 0) {
      ctx.addIssue({ code: 'custom', path: ['content'], message: '发布状态的文章正文不能为空' })
    }
  })

export type PostStatus = z.infer<typeof postStatusSchema>
export type Post = z.infer<typeof postSchema>
