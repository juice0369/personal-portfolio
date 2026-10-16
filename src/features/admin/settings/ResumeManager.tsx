import { useEffect, useRef, useState } from 'react'
import { useContent } from '../../../content/useContent'
import { formatTimestamp } from '../../../lib/date'
import { formatBytes, validateResumeFile } from '../../../lib/file-validation'
import { deleteAsset, putAsset } from '../../../lib/storage/asset-db'
import { useAssetUrl } from '../../../hooks/useAssetUrl'
import { useConfirm } from '../../../hooks/confirm-context'
import { useToast } from '../../../hooks/toast-context'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { IconEye, IconTrash, IconUpload } from '../../../components/icons'

/**
 * 简历文件管理（F-19 / AC-F19）。
 *
 * 上传 → 校验（仅 PDF、≤ 5MB、非空、MIME 与扩展名一致）→ 写入 IndexedDB → 更新 resumeAssetId。
 * 预览在页面内以 `<object>` 内嵌显示（CSP 已允许 `object-src blob:`），
 * 并额外提供"在新标签页打开"作为不支持内嵌预览时的回退。
 * 未上传时前台下载回落到内置简历 `/resume-sample.pdf`（站点所有者本人的简历文件）。
 */
export function ResumeManager() {
  const { state, dispatch, notifyAssetChange } = useContent()
  const { pushToast } = useToast()
  const confirm = useConfirm()

  const saved = useAssetUrl(state.settings.resumeAssetId)
  const [pending, setPending] = useState<{ file: File } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasUploaded = state.settings.resumeAssetId === 'resume' && saved.ref !== null

  // 简历被替换或删除后，已展开的预览必须失效，否则会继续显示旧文件
  useEffect(() => {
    setPreviewOpen(false)
  }, [saved.ref?.updatedAt, state.settings.resumeAssetId])

  function handlePick(file: File | undefined) {
    if (!file) return
    const check = validateResumeFile(file)
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

    if (hasUploaded) {
      const confirmed = await confirm({
        title: '替换当前简历？',
        description: `当前简历为「${saved.ref?.fileName ?? '已上传文件'}」，替换后前台「下载简历」会立即使用新文件，旧文件将被覆盖且无法恢复。`,
        confirmLabel: '替换简历',
      })
      if (!confirmed) return
    }

    setBusy(true)
    try {
      await putAsset({
        id: 'resume',
        kind: 'pdf',
        fileName: pending.file.name,
        mimeType: pending.file.type,
        blob: pending.file,
      })
      dispatch({ type: 'patchSettings', patch: { resumeAssetId: 'resume' } })
      notifyAssetChange()
      setPending(null)
      pushToast({ level: 'success', message: '简历已保存，前台下载入口立即使用新文件' })
    } catch {
      pushToast({ level: 'error', message: '简历保存失败，请重试' })
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: '删除已上传的简历？',
      description:
        '删除后前台「下载简历」会回落到内置的简历 PDF。此操作不可撤销，需要时只能重新上传。',
      confirmLabel: '删除简历',
    })
    if (!confirmed) return

    await deleteAsset('resume')
    dispatch({ type: 'patchSettings', patch: { resumeAssetId: null } })
    notifyAssetChange()
    setPending(null)
    pushToast({ level: 'success', message: '已删除简历，前台回落到内置简历' })
  }

  return (
    <Card as="section">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-parchment-100">简历文件</h2>
          <p className="mt-1 max-w-[60ch] text-xs leading-5 text-parchment-500">
            仅支持 PDF，大小不超过 5MB。文件保存在浏览器的 IndexedDB 中，不会上传到任何服务器。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(event) => {
              handlePick(event.target.files?.[0])
              // 清空 value，允许连续选择同一个文件
              event.target.value = ''
            }}
          />
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            <IconUpload />
            {hasUploaded ? '替换简历' : '选择简历'}
          </Button>
          <Button onClick={handleSave} disabled={pending === null || busy}>
            {busy ? '正在保存…' : '保存文件'}
          </Button>
          {pending !== null ? (
            <Button variant="ghost" onClick={() => setPending(null)}>
              取消选择
            </Button>
          ) : null}
          {hasUploaded ? (
            <Button variant="ghost" onClick={() => void handleDelete()}>
              <IconTrash />
              删除简历
            </Button>
          ) : null}
        </div>
      </div>

      {error !== null ? (
        <p role="alert" className="mt-3 text-xs leading-5 text-danger-400">
          {error}
        </p>
      ) : null}

      <div className="mt-4 rounded-control border border-ink-700 bg-ink-900 px-4 py-3">
        {saved.ref === null ? (
          <p className="text-sm text-parchment-300">
            <Badge tone="muted">内置简历</Badge>
            <span className="ml-2">当前未上传简历，前台「下载简历」会下载内置的简历 PDF。</span>
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-parchment-100">
            <span className="min-w-0 truncate">{saved.ref.fileName}</span>
            <span className="text-xs text-parchment-500 tabular-nums">
              {formatBytes(saved.ref.size)}
            </span>
            <span className="text-xs text-parchment-500 tabular-nums">
              上传于 {formatTimestamp(saved.ref.updatedAt)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={previewOpen}
              disabled={saved.url === null}
              onClick={() => setPreviewOpen((open) => !open)}
            >
              <IconEye />
              {previewOpen ? '收起预览' : '预览'}
            </Button>
            {saved.url !== null ? (
              <a
                href={saved.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-control text-xs text-champagne-400 hover:text-champagne-200 focus-visible:focus-ring"
              >
                在新标签页打开
                <span className="sr-only">（在新标签页打开）</span>
              </a>
            ) : null}
          </div>
        )}

        {pending !== null ? (
          <p className="mt-2 text-xs leading-5 text-champagne-400">
            待保存：{pending.file.name}（{formatBytes(pending.file.size)}）。点击「保存文件」后才会
            替换当前简历。
          </p>
        ) : null}
      </div>

      {previewOpen && saved.url !== null ? (
        <div className="mt-4">
          <p className="mb-2 text-xs text-parchment-500">预览</p>
          <object
            data={saved.url}
            type="application/pdf"
            aria-label="简历预览"
            className="h-96 w-full rounded-control border border-ink-700 bg-ink-900"
          >
            <p className="p-4 text-sm leading-6 text-parchment-300">
              当前浏览器不支持内嵌预览，可以点击上方的「在新标签页打开」查看简历。
            </p>
          </object>
        </div>
      ) : null}
    </Card>
  )
}
