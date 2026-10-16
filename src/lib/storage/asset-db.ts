import { clear, createStore, del, get, set } from 'idb-keyval'
import { ASSET_DB_NAME, ASSET_STORE_NAME } from '../constants'
import { nowTimestamp } from '../date'
import {
  assetRefSchema,
  storedAssetSchema,
  type AssetId,
  type AssetKind,
  type AssetRef,
  type StoredAsset,
} from '../schema'

/**
 * 头像与简历的二进制存储。
 *
 * 取舍说明：元数据与 Blob 存在同一条记录里，读取元数据时会连带读出 Blob。
 * 头像 ≤ 2MB、简历 ≤ 5MB，这个开销可以接受；若后续资源变多再拆成两条记录。
 */

const assetStore = createStore(ASSET_DB_NAME, ASSET_STORE_NAME)

export type PutAssetInput = {
  id: AssetId
  kind: AssetKind
  fileName: string
  mimeType: string
  blob: Blob
}

function toRef(asset: StoredAsset): AssetRef {
  return {
    id: asset.id,
    kind: asset.kind,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    size: asset.size,
    updatedAt: asset.updatedAt,
  }
}

export async function putAsset(input: PutAssetInput): Promise<AssetRef> {
  const ref: AssetRef = {
    id: input.id,
    kind: input.kind,
    fileName: input.fileName,
    // 个别系统不提供 MIME，此时记录一个通用值以满足非空约束
    mimeType: input.mimeType.length > 0 ? input.mimeType : 'application/octet-stream',
    size: Math.max(1, input.blob.size),
    updatedAt: nowTimestamp(),
  }

  await set(input.id, { ...ref, blob: input.blob } satisfies StoredAsset, assetStore)
  return ref
}

export async function getStoredAsset(id: AssetId): Promise<StoredAsset | null> {
  const value = await get(id, assetStore)
  if (value === undefined || value === null) return null

  const parsed = storedAssetSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

export async function getAssetRef(id: AssetId): Promise<AssetRef | null> {
  const asset = await getStoredAsset(id)
  if (!asset) return null
  return assetRefSchema.parse(toRef(asset))
}

export async function deleteAsset(id: AssetId): Promise<void> {
  await del(id, assetStore)
}

export async function clearAssets(): Promise<void> {
  await clear(assetStore)
}
