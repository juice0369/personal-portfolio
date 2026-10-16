import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { IconClose } from '../icons'

/**
 * 弹窗 / 抽屉 / 确认框的公共外壳：遮罩、焦点限制、Esc 关闭、body 滚动锁定。
 * 遮罩使用 button（带 tabIndex=-1）而不是可点击的 div，
 * 这样既满足 jsx-a11y 规则，又能让鼠标点击遮罩关闭对话框（AC-F11 / AC-X01）。
 */
export function DialogShell({
  open,
  onClose,
  labelledBy,
  describedBy,
  role = 'dialog',
  placement = 'center',
  panelClassName,
  showCloseButton = true,
  closeLabel = '关闭',
  children,
}: {
  open: boolean
  onClose: () => void
  labelledBy: string
  describedBy?: string
  role?: 'dialog' | 'alertdialog'
  placement?: 'center' | 'right'
  panelClassName?: string
  showCloseButton?: boolean
  closeLabel?: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useFocusTrap({
    active: open,
    containerRef: panelRef,
    onEscape: onClose,
    initialFocusRef: showCloseButton ? closeButtonRef : undefined,
  })

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={
        placement === 'center'
          ? 'fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center'
          : 'fixed inset-0 z-50 flex justify-end'
      }
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink-900/80"
      />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={[
          'relative flex flex-col border border-ink-700 bg-ink-800 shadow-panel',
          placement === 'center'
            ? 'my-auto w-full max-w-lg rounded-card'
            : 'h-full w-full max-w-md rounded-none border-y-0 border-r-0 sm:rounded-l-card',
          panelClassName,
        ]
          .filter((part) => part && part.length > 0)
          .join(' ')}
      >
        {showCloseButton ? (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute top-3 right-3 rounded-control p-2 text-parchment-500 hover:text-parchment-100 focus-visible:focus-ring"
          >
            <IconClose />
          </button>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  )
}
