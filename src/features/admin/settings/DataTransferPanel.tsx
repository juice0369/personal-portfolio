import { useRef, useState } from 'react'
import { useContent } from '../../../content/useContent'
import { summarizeDiff, type DiffSummary } from '../../../lib/diff'
import { formatTimestamp } from '../../../lib/date'
import {
  buildExportFileName,
  buildExportPayload,
  downloadJsonFile,
  readImportFile,
} from '../../../lib/storage/transfer'
import { getAssetRef } from '../../../lib/storage/asset-db'
import type { ContentState } from '../../../lib/schema'
import { useConfirm } from '../../../hooks/confirm-context'
import { useToast } from '../../../hooks/toast-context'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { IconDownload, IconUndo, IconUpload } from '../../../components/icons'

/** 差异摘要的表格化呈现，放在二次确认对话框里让用户先看清再决定 */
function DiffTable({ diff }: { diff: DiffSummary }) {
  return (
    <div className="space-y-3">
      <table className="w-full border-collapse text-left text-xs">
        <caption className="sr-only">当前数据与导入数据的数量对比</caption>
        <thead>
          <tr className="text-parchment-500">
            <th scope="col" className="py-1 font-normal">
              集合
            </th>
            <th scope="col" className="py-1 text-right font-normal">
              当前
            </th>
            <th scope="col" className="py-1 text-right font-normal">
              导入后
            </th>
          </tr>
        </thead>
        <tbody>
          {diff.rows.map((row) => (
            <tr key={row.key} className="border-t border-ink-700">
              <th scope="row" className="py-1 font-normal text-parchment-300">
                {row.label}
              </th>
              <td className="py-1 text-right text-parchment-300 tabular-nums">{row.current}</td>
              <td
                className={[
                  'py-1 text-right tabular-nums',
                  row.current === row.incoming ? 'text-parchment-300' : 'text-champagne-400',
                ].join(' ')}
              >
                {row.incoming}
                {row.current === row.incoming ? null : (
                  <span className="sr-only">
                    （与当前不同，{row.incoming > row.current ? '新增' : '减少'}了{' '}
                    {Math.abs(row.incoming - row.current)} 项）
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs leading-5 text-parchment-500 tabular-nums">
        当前数据更新于 {formatTimestamp(diff.currentUpdatedAt)}，
        <br />
        导入数据更新于 {formatTimestamp(diff.incomingUpdatedAt)}。
      </p>

      {diff.isOlder ? (
        <p className="rounded-control border border-danger-400/50 px-3 py-2 text-xs leading-5 text-danger-400">
          注意：导入的数据比当前数据更旧，确认后会用这份更旧的数据覆盖当前内容。
        </p>
      ) : null}

      {diff.hasChanges ? null : (
        <p className="text-xs leading-5 text-parchment-500">
          各集合数量完全相同，导入只会替换内容细节与更新时间。
        </p>
      )}
    </div>
  )
}

/**
 * 数据导出、导入与恢复默认（F-20 / AC-F20）。
 *
 * 导入分四步且任何一步失败都不修改现有数据：
 * 类型与体积校验 → JSON.parse → contentStateSchema 校验 → 差异确认 → replaceAll 写入。
 * 写入只使用 schema 校验结果的 data，未知键（含 __proto__）已在 schema 层被剥离，
 * 写入走 reducer 的 replaceAll，不做对象展开合并（AGENTS.md §6.4）。
 */
export function DataTransferPanel() {
  const { state, replaceAll, resetToSeed } = useContent()
  const { pushToast } = useToast()
  const confirm = useConfirm()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  function handleExport() {
    downloadJsonFile(buildExportPayload(state), buildExportFileName())
    pushToast({
      level: 'success',
      message: '已导出内容数据。头像与简历是二进制文件，不在导出内容中，请在新设备上重新上传。',
      durationMs: 9000,
    })
  }

  /** 导入后检查被引用的文件是否真的存在，缺失时给出重新上传的指引 */
  async function reportMissingAssets(next: ContentState) {
    const missing: string[] = []
    if (next.profile.avatarAssetId !== null) {
      const avatar = await getAssetRef('avatar')
      if (avatar === null) missing.push('头像')
    }
    if (next.settings.resumeAssetId !== null) {
      const resume = await getAssetRef('resume')
      if (resume === null) missing.push('简历')
    }

    if (missing.length > 0) {
      pushToast({
        level: 'info',
        message: `导入的内容引用了本地尚不存在的${missing.join('与')}文件，前台已回落到内置资源。可以在「个人资料」或本页重新上传。`,
        durationMs: 0,
      })
    }
  }

  async function handleImport(file: File | undefined) {
    if (!file) return

    setBusy(true)
    try {
      const result = await readImportFile(file)
      if (!result.ok) {
        pushToast({
          level: 'error',
          message: result.message,
          action:
            result.details.length === 0
              ? undefined
              : {
                  label: '查看详情',
                  onClick: () =>
                    pushToast({ level: 'info', message: result.details.join('；'), durationMs: 0 }),
                },
        })
        return
      }

      const diff = summarizeDiff(state, result.state)
      const confirmed = await confirm({
        title: '用导入的数据替换当前内容？',
        description: <DiffTable diff={diff} />,
        confirmLabel: '替换全部内容',
      })
      if (!confirmed) return

      replaceAll(result.state)
      await reportMissingAssets(result.state)
      pushToast({ level: 'success', message: '导入完成，前台已立即显示导入的内容' })
    } catch {
      pushToast({ level: 'error', message: '导入过程中出现异常，现有数据未被修改' })
    } finally {
      setBusy(false)
    }
  }

  async function handleReset() {
    const confirmed = await confirm({
      title: '恢复内置默认数据？',
      description:
        '这会删除全部本地内容数据，以及已上传的头像与简历文件，前台随后显示随源码提供的默认数据。此操作不可撤销，建议先导出 JSON 备份。',
      confirmLabel: '清空本地数据并恢复默认',
    })
    if (!confirmed) return

    setBusy(true)
    try {
      await resetToSeed()
      pushToast({ level: 'success', message: '已恢复内置默认数据，本地上传的文件同时被清除' })
    } catch {
      pushToast({ level: 'error', message: '恢复默认数据失败，请重试' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card as="section">
        <h2 className="text-base font-semibold text-parchment-100">导出数据</h2>
        <p className="mt-1 max-w-[68ch] text-xs leading-5 text-parchment-500">
          导出一个含版本号与导出时间的 JSON 文件，内容为当前的全部内容数据。
          <strong className="text-parchment-300">头像与简历是二进制文件，不包含在导出内容中</strong>
          ，在新设备上需要重新上传这两个文件。
        </p>
        <div className="mt-4">
          <Button onClick={handleExport}>
            <IconDownload />
            导出 JSON
          </Button>
        </div>
      </Card>

      <Card as="section">
        <h2 className="text-base font-semibold text-parchment-100">导入数据</h2>
        <p className="mt-1 max-w-[68ch] text-xs leading-5 text-parchment-500">
          选择一个由本站导出的 JSON 文件（不超过 2MB）。校验通过后会先显示与当前数据的差异摘要，
          确认后才写入；任何一步失败都不会修改现有数据。
        </p>
        <div className="mt-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              void handleImport(event.target.files?.[0])
              // 清空 value，允许连续选择同一个文件
              event.target.value = ''
            }}
          />
          <Button variant="secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
            <IconUpload />
            {busy ? '正在处理…' : '选择 JSON 文件'}
          </Button>
        </div>
      </Card>

      <Card as="section" className="border-danger-400/40">
        <h2 className="text-base font-semibold text-parchment-100">恢复默认数据</h2>
        <p className="mt-1 max-w-[68ch] text-xs leading-5 text-parchment-500">
          清空浏览器里保存的全部内容数据与已上传文件，回到随源码提供的默认数据。
          当前数据保存在本浏览器中，清空后无法找回，操作前请先导出备份。
        </p>
        <div className="mt-4">
          <Button variant="danger" disabled={busy} onClick={() => void handleReset()}>
            <IconUndo />
            恢复默认数据
          </Button>
        </div>
      </Card>
    </div>
  )
}
