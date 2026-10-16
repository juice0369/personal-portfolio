import { useId, type ReactNode } from 'react'
import { DialogShell } from './DialogShell'

/** 右侧抽屉：用于项目编辑等字段较多、需要纵向滚动空间的表单 */
export function Drawer({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  description?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  const titleId = useId()
  const descriptionId = description ? `${titleId}-description` : undefined

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={descriptionId}
      placement="right"
    >
      <div className="border-b border-ink-700 px-5 py-4 pr-14">
        <h2 id={titleId} className="text-lg font-semibold text-parchment-100">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mt-1 text-sm text-parchment-300">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer ? <div className="border-t border-ink-700 px-5 py-4">{footer}</div> : null}
    </DialogShell>
  )
}
