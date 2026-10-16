import { useId, type ReactNode } from 'react'
import { DialogShell } from './DialogShell'
import { Button } from './Button'
import { IconAlert } from '../icons'

/**
 * 二次确认对话框（X-01）。
 * 确认按钮文案由调用方给出，必须描述具体后果，不使用模糊的"确定"。
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = '取消',
  tone = 'danger',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}) {
  const titleId = useId()
  const descriptionId = `${titleId}-description`

  return (
    <DialogShell
      open={open}
      onClose={onCancel}
      role="alertdialog"
      labelledBy={titleId}
      describedBy={descriptionId}
      showCloseButton={false}
    >
      <div className="px-5 py-5">
        <div className="flex items-start gap-3">
          {tone === 'danger' ? (
            <span className="mt-0.5 shrink-0 text-lg text-danger-400">
              <IconAlert />
            </span>
          ) : null}
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-parchment-100">
              {title}
            </h2>
            {description ? (
              <div id={descriptionId} className="mt-2 text-sm leading-6 text-parchment-300">
                {description}
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </DialogShell>
  )
}
