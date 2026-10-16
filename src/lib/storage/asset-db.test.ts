import { beforeEach, describe, expect, it } from 'vitest'
import { createStore, set as idbSet } from 'idb-keyval'
import { ASSET_DB_NAME, ASSET_STORE_NAME } from '../constants'
import { clearAssets, deleteAsset, getAssetRef, getStoredAsset, putAsset } from './asset-db'

const store = createStore(ASSET_DB_NAME, ASSET_STORE_NAME)

function buildPdfBlob(content = 'fake-pdf'): Blob {
  return new Blob([content], { type: 'application/pdf' })
}

beforeEach(async () => {
  await clearAssets()
})

describe('putAsset / getStoredAsset', () => {
  it('写入后能读回元数据与二进制内容', async () => {
    const blob = buildPdfBlob()
    await putAsset({
      id: 'resume',
      kind: 'pdf',
      fileName: 'resume-2026.pdf',
      mimeType: 'application/pdf',
      blob,
    })

    const stored = await getStoredAsset('resume')
    expect(stored).not.toBeNull()
    expect(stored?.fileName).toBe('resume-2026.pdf')
    expect(stored?.kind).toBe('pdf')
    expect(stored?.size).toBe(blob.size)
    expect(await stored?.blob.text()).toBe('fake-pdf')
  })

  it('未写入的槽位返回 null', async () => {
    expect(await getStoredAsset('avatar')).toBeNull()
    expect(await getAssetRef('avatar')).toBeNull()
  })

  it('MIME 缺失时记录通用类型，避免非空约束失败', async () => {
    await putAsset({
      id: 'avatar',
      kind: 'image',
      fileName: 'avatar.png',
      mimeType: '',
      blob: new Blob(['x']),
    })

    const ref = await getAssetRef('avatar')
    expect(ref?.mimeType).toBe('application/octet-stream')
  })

  it('同一槽位重复写入时覆盖旧记录', async () => {
    await putAsset({
      id: 'resume',
      kind: 'pdf',
      fileName: 'old.pdf',
      mimeType: 'application/pdf',
      blob: buildPdfBlob('old'),
    })
    await putAsset({
      id: 'resume',
      kind: 'pdf',
      fileName: 'new.pdf',
      mimeType: 'application/pdf',
      blob: buildPdfBlob('newer-content'),
    })

    const stored = await getStoredAsset('resume')
    expect(stored?.fileName).toBe('new.pdf')
    expect(await stored?.blob.text()).toBe('newer-content')
  })

  it('记录损坏（缺少 blob）时读取返回 null，而不是抛出异常', async () => {
    await idbSet(
      'avatar',
      {
        id: 'avatar',
        kind: 'image',
        fileName: 'broken.png',
        mimeType: 'image/png',
        size: 10,
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      store,
    )

    await expect(getStoredAsset('avatar')).resolves.toBeNull()
  })
})

describe('getAssetRef', () => {
  it('返回的元数据不含二进制内容', async () => {
    await putAsset({
      id: 'avatar',
      kind: 'image',
      fileName: 'avatar.png',
      mimeType: 'image/png',
      blob: new Blob(['x'], { type: 'image/png' }),
    })

    const ref = await getAssetRef('avatar')
    expect(ref).not.toBeNull()
    expect(Object.keys(ref ?? {})).not.toContain('blob')
  })
})

describe('deleteAsset / clearAssets', () => {
  it('删除单个槽位不影响另一个槽位', async () => {
    await putAsset({
      id: 'avatar',
      kind: 'image',
      fileName: 'avatar.png',
      mimeType: 'image/png',
      blob: new Blob(['a']),
    })
    await putAsset({
      id: 'resume',
      kind: 'pdf',
      fileName: 'resume.pdf',
      mimeType: 'application/pdf',
      blob: buildPdfBlob(),
    })

    await deleteAsset('avatar')

    expect(await getStoredAsset('avatar')).toBeNull()
    expect(await getStoredAsset('resume')).not.toBeNull()
  })

  it('clearAssets 清空全部槽位', async () => {
    await putAsset({
      id: 'avatar',
      kind: 'image',
      fileName: 'avatar.png',
      mimeType: 'image/png',
      blob: new Blob(['a']),
    })
    await putAsset({
      id: 'resume',
      kind: 'pdf',
      fileName: 'resume.pdf',
      mimeType: 'application/pdf',
      blob: buildPdfBlob(),
    })

    await clearAssets()

    expect(await getStoredAsset('avatar')).toBeNull()
    expect(await getStoredAsset('resume')).toBeNull()
  })
})
