import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return []
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  )
}

/**
 * 弹窗 / 抽屉 / 移动端菜单的焦点管理：
 * 打开时把焦点移入容器，Tab 在容器内循环，Esc 触发关闭，关闭后焦点回到触发元素（PRD §8.4 第 4 条）。
 */
export function useFocusTrap(options: {
  active: boolean
  containerRef: RefObject<HTMLElement | null>
  onEscape?: () => void
  initialFocusRef?: RefObject<HTMLElement | null>
}): void {
  const { active, containerRef, onEscape, initialFocusRef } = options
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const initial = initialFocusRef?.current ?? getFocusable(container)[0] ?? container
    initial?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape?.()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = getFocusable(containerRef.current)
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const activeElement = document.activeElement
      const inside = containerRef.current?.contains(activeElement) ?? false

      if (event.shiftKey && (activeElement === first || !inside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (activeElement === last || !inside)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      previouslyFocused.current?.focus()
    }
  }, [active, containerRef, onEscape, initialFocusRef])
}
