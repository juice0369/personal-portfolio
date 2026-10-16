import { z } from 'zod'

/** YYYY-MM，用于经历与项目的起止时间 */
export const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, '格式应为 YYYY-MM，例如 2024-09')

/** YYYY-MM-DD，用于文章发布日期 */
export const isoDate = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, '格式应为 YYYY-MM-DD，例如 2026-10-16')

/** ISO 8601 时间戳（含时区），用于 updatedAt 等 */
export const timestamp = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/, '时间戳格式不正确')

/**
 * 仅允许 http/https 链接，用于阻断 javascript: 等伪协议。
 * 刻意不使用 z.url()，以便对协议做显式白名单校验。
 */
export const httpUrl = z
  .string()
  .trim()
  .min(1, '请输入链接')
  .refine((value) => /^https?:\/\/\S+$/i.test(value), '仅支持 http 或 https 链接')

export const nullableHttpUrl = z.union([httpUrl, z.null()])
export const nullableYearMonth = z.union([yearMonth, z.null()])

/** slug：小写字母、数字、汉字与连字符，供详情页地址使用 */
export const slug = z
  .string()
  .min(1, '标识不能为空')
  .max(80, '标识不能超过 80 个字符')
  .regex(
    /^[\p{Script=Han}a-z0-9]+(?:-[\p{Script=Han}a-z0-9]+)*$/u,
    '标识只能包含小写字母、数字、汉字与连字符，且不能以连字符开头或结尾',
  )

/** 必填文本：自动去除首尾空白后校验长度 */
export const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label}不能为空`).max(max, `${label}不能超过 ${max} 个字符`)

/** 可选文本：允许为空字符串，界面据此决定是否渲染该条目 */
export const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label}不能超过 ${max} 个字符`)

/** 字符串数组（标签类字段） */
export const textList = (label: string, maxItems: number, itemMax: number) =>
  z.array(requiredText(label, itemMax)).max(maxItems, `最多 ${maxItems} 个${label}`)

/** 非负整数排序值 */
export const orderValue = z.int().min(0, '排序值不能为负数')

/** 1–5 的熟练度 */
export const levelValue = z.int().min(1, '熟练度最低为 1').max(5, '熟练度最高为 5')
