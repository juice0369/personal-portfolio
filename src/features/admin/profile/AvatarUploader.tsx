import { useRef, useState } from 'react'
import { useContent } from '../../../content/useContent'
import { FALLBACK_AVATAR_URL } from '../../../lib/constants'
import { formatBytes, validateAvatarFile } from '../../../lib/file-validation'
import { formatTimestamp } from '../../../lib/date'
import { putAsset, deleteAsset } from '../../../lib/storage/asset-db'
import { useAssetUrl, useObjectUrl } from '../../../hooks/useAssetUrl'
import { useConfirm } from '../../../hooks/confirm-context'
import { useToast } from '../../../hooks/toast-context'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { IconTrash, IconUpload } from '../../../components/icons'

/**
 * 头像上传与预览（F-15 / AC-F15）。
 *
 * 流程：选择文件 → 校验（体积 / 非空 / MIME / 扩展名 / 两者一致）→ 立即预览 → 保存写入 IndexedDB。
 * 校验失败只提示，不修改当前头像；预览用的 object URL 由 useObjectUrl 在取消或卸载时释放。
 */
export function AvatarUploader() {
  const { state, dispatch, notifyAssetChange } = useContent()
  const { pushToast } = useToast()
  const confirm = useConfirm()

  const saved = useAssetUrl(state.profile.avatarAssetId)
  const [pending, setPending] = useState<{ file: File } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingUrl = useObjectUrl(pending?.file ?? null)

  const previewSrc = pendingUrl ?? saved.url ?? FALLBACK_AVATAR_URL
  const hasUploadedAvatar = state.profile.avatarAssetId === 'avatar' && saved.url !== null

  function handlePick(file: File | undefined) {
    if (!file) return
    const check = validateAvatarFile(file)
    if (!check.ok) {
      setError(check.message)
      pushToast({ level: 'error', message: check.message })
      return
    }
    setError(null)
    setPending({ file })
  }

  async function handleSave() {
    if (pending === null) return
    setBusy(true)
    try {
      await putAsset({
        id: 'avatar',
        kind: 'image',
        fileName: pending.file.name,
        mimeType: pending.file.type,
        blob: pending.file,
      })
      dispatch({ type: 'patchProfile', patch: { avatarAssetId: 'avatar' } })
      notifyAssetChange()
      setPending(null)
      pushToast({ level: 'success', message: '头像已保存，前台会立即显示新头像' })
    } catch {
      pushToast({ level: 'error', message: '头像保存失败，请重试' })
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove() {
    const confirmed = await confirm({
      title: '移除已上传的头像？',
      description: '移除后将回落到内置头像，前台会立即更新。此操作不可撤销。',
      confirmLabel: '移除头像',
    })
    if (!confirmed) return

    await deleteAsset('avatar')
    dispatch({ type: 'patchProfile', patch: { avatarAssetId: null } })
    notifyAssetChange()
    setPending(null)
    pushToast({ level: 'success', message: '已移除头像，前台回落到内置头像' })
  }

  return (
    <section
      aria-labelledby="avatar-title"
      className="rounded-card border border-ink-700 bg-ink-800 p-5"
    >
      <h2 id="avatar-title" className="text-base font-semibold text-parchment-100">
        头像
      </h2>
      <p className="mt-1 text-xs leading-5 text-parchment-500">
        支持 PNG、JPEG、WebP，大小不超过 2MB。文件保存在 IndexedDB，不会上传到任何服务器。
      </p>

      <div className="mt-4 flex flex-wrap items-start gap-5">
        <img
          src={previewSrc}
          alt="头像预览"
          width={112}
          height={112}
          className="h-24 w-24 rounded-full border border-ink-600 object-cover"
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                handlePick(event.target.files?.[0])
                // 清空 value，允许连续选择同一个文件
                event.target.value = ''
              }}
            />
            <Button variant="secondary" onClick={() => inputRef.current?.click()}>
              <IconUpload />
              选择图片
            </Button>
            <Button onClick={handleSave} disabled={pending === null || busy}>
              {busy ? '正在保存…' : '保存头像'}
            </Button>
            {pending !== null ? (
              <Button variant="ghost" onClick={() => setPending(null)}>
                取消选择
              </Button>
            ) : null}
            {hasUploadedAvatar ? (
              <Button variant="ghost" onClick={handleRemove}>
                <IconTrash />
                移除头像
              </Button>
            ) : null}
          </div>

          {error !== null ? (
            <p role="alert" className="text-xs leading-5 text-danger-400">
              {error}
            </p>
          ) : null}

          {pending !== null ? (
            <p className="text-xs text-parchment-300">
              待保存：{pending.file.name}（{formatBytes(pending.file.size)}
              ）。点击「保存头像」后才会写入本地存储。
            </p>
          ) : null}

          {saved.ref !== null ? (
            <div className="rounded-control border border-ink-700 bg-ink-900 px-3 py-2.5 text-xs leading-6 text-parchment-300">
              <p>
                当前文件：{saved.ref.fileName}（{formatBytes(saved.ref.size)}）
              </p>
              <p className="text-parchment-500">上传时间：{formatTimestamp(saved.ref.updatedAt)}</p>
            </div>
          ) : (
            <p className="text-xs text-parchment-500">
              <Badge tone="muted">内置头像</Badge>
              <span className="ml-2">尚未上传头像，前台正在使用内置头像。</span>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
