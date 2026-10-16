import { z } from 'zod'
import { httpUrl, optionalText, requiredText, timestamp } from './primitives'

/** 预定义图标名，避免用户输入任意字符串导致渲染不确定 */
export const SOCIAL_ICON_NAMES = [
  'github',
  'mail',
  'link',
  'twitter',
  'zhihu',
  'juejin',
  'wechat',
  'linkedin',
] as const

export const socialIconSchema = z.enum(SOCIAL_ICON_NAMES)

export const socialLinkSchema = z.object({
  id: z.string().min(1),
  label: requiredText('链接名称', 20),
  url: httpUrl,
  icon: socialIconSchema,
})

/** 手机号：允许数字、空格、+、-、括号，长度 6–20 */
const phoneSchema = optionalText('手机号', 20).refine(
  (value) => value === '' || /^[\d+\-\s()]{6,20}$/.test(value),
  '手机号格式不正确（只能包含数字、空格、+、-、括号）',
)

/** 邮箱：不做完整 RFC 校验，只拦住明显错误 */
const emailSchema = z
  .string()
  .trim()
  .min(1, '邮箱不能为空')
  .max(120, '邮箱不能超过 120 个字符')
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '邮箱格式不正确')

export const profileSchema = z.object({
  name: requiredText('姓名', 40),
  headline: requiredText('职业方向', 60),
  bio: requiredText('个人简介', 600),
  avatarAssetId: z.union([z.literal('avatar'), z.null()]),
  email: emailSchema,
  phone: phoneSchema,
  location: optionalText('所在城市', 40),
  socials: z.array(socialLinkSchema).max(6, '最多添加 6 个社交链接'),
  updatedAt: timestamp,
})

export type SocialLink = z.infer<typeof socialLinkSchema>
export type Profile = z.infer<typeof profileSchema>
