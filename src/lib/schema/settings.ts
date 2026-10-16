import { z } from 'zod'
import { MAX_POSTS_PER_PAGE, MIN_POSTS_PER_PAGE } from '../constants'
import { optionalText, requiredText, timestamp } from './primitives'

export const siteSettingsSchema = z.object({
  siteTitle: requiredText('站点标题', 60),
  siteDescription: optionalText('站点描述', 160),
  footerText: optionalText('页脚文案', 100),
  starfieldEnabled: z.boolean(),
  postsPerPage: z
    .int()
    .min(MIN_POSTS_PER_PAGE, `每页条数不能少于 ${MIN_POSTS_PER_PAGE}`)
    .max(MAX_POSTS_PER_PAGE, `每页条数不能超过 ${MAX_POSTS_PER_PAGE}`),
  resumeAssetId: z.union([z.literal('resume'), z.null()]),
  updatedAt: timestamp,
})

export type SiteSettings = z.infer<typeof siteSettingsSchema>
