import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './ConfirmDialog'

/** 用一个小宿主组件模拟真实用法：由外部状态控制打开与关闭 */
function Harness({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        删除这一项
      </button>
      <ConfirmDialog
        open={open}
        title="删除这一项？"
        description="删除后无法恢复。"
        confirmLabel="删除这一项"
        onConfirm={onConfirm}
        onCancel={() => {
          setOpen(false)
          onCancel()
        }}
      />
    </>
  )
}

describe('ConfirmDialog（AC-X01）', () => {
  it('默认不渲染对话框，首次点击触发按钮不产生任何回调', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<Harness onConfirm={onConfirm} onCancel={onCancel} />)

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('打开后是 alertdialog，并带标题与说明', async () => {
    const user = userEvent.setup()
    render(<Harness onConfirm={vi.fn()} onCancel={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '删除这一项' }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAccessibleName('删除这一项？')
    expect(dialog).toHaveAccessibleDescription('删除后无法恢复。')
  })

  it('点击取消只触发取消回调，不触发确认回调，也不删除数据', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<Harness onConfirm={onConfirm} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: '删除这一项' }))
    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('确认按钮的文案描述具体后果，而不是"确定"', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<Harness onConfirm={onConfirm} onCancel={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '删除这一项' }))
    // 触发按钮与确认按钮同名，因此这里按对话框范围查找
    const dialog = screen.getByRole('alertdialog')
    const buttons = Array.from(dialog.querySelectorAll('button')).map(
      (button) => button.textContent,
    )
    expect(buttons).toContain('删除这一项')
    expect(buttons).not.toContain('确定')
  })

  it('按 Esc 关闭对话框，且焦点回到触发元素', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(<Harness onConfirm={onConfirm} onCancel={onCancel} />)

    const trigger = screen.getByRole('button', { name: '删除这一项' })
    await user.click(trigger)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
  })
})
