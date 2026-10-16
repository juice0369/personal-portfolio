import { z } from 'zod'
import { timestamp } from './primitives'

/** 资源槽位：头像与简历，与 IndexedDB 的键一致 */
export const ASSET_IDS = ['avatar', 'resume'] as const
export const assetIdSchema = z.enum(ASSET_IDS)

export const ASSET_KINDS = ['image', 'pdf'] as const
export const assetKindSchema = z.enum(ASSET_KINDS)

/** 资源元数据：进入内容状态与界面显示的部分 */
export const assetRefSchema = z.object({
  id: assetIdSchema,
  kind: assetKindSchema,
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().min(1),
  updatedAt: timestamp,
})

/** 完整记录：元数据 + 二进制内容，只在存储层内部流转 */
export const storedAssetSchema = assetRefSchema.extend({
  blob: z.custom<Blob>((value) => typeof Blob !== 'undefined' && value instanceof Blob),
})

export type AssetId = z.infer<typeof assetIdSchema>
export type AssetKind = z.infer<typeof assetKindSchema>
export type AssetRef = z.infer<typeof assetRefSchema>
export type StoredAsset = z.infer<typeof storedAssetSchema>
