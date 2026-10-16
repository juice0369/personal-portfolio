import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { requiredText } from '../lib/schema'
import { TextField } from '../components/ui/Field'
import { useForm } from './useForm'

const schema = z.object({
  name: requiredText('姓名', 10),
  email: z
    .string()
    .trim()
    .min(1, '邮箱不能为空')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '邮箱格式不正确'),
})

type Values = z.infer<typeof schema>

function FormHarness({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useForm<Values, Values>({
    schema,
    initialValues: { name: '', email: '' },
    onSubmit,
  })

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <TextField
        name="name"
        label="姓名"
        value={form.values.name}
        error={form.errors.name}
        onChange={(value) => form.setValue('name', value)}
        onBlur={() => form.validateField('name')}
      />
      <TextField
        name="email"
        label="邮箱"
        value={form.values.email}
        error={form.errors.email}
        onChange={(value) => form.setValue('email', value)}
        onBlur={() => form.validateField('email')}
      />
      <button type="submit">保存</button>
    </form>
  )
}

/** 字段的错误提示与输入框通过 aria-describedby 关联（AGENTS.md §3.3） */
function describedErrorOf(input: HTMLElement): string | null {
  const ids = input.getAttribute('aria-describedby')
  if (ids === null) return null
  const parts = ids
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .filter((text) => text.length > 0)
  return parts.join(' ') || null
}

describe('useForm 校验时机（X-02）', () => {
  it('刚打开表单时不显示任何错误', () => {
    render(<FormHarness onSubmit={vi.fn()} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/姓名/)).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('提交时一次性列出全部字段错误并阻止提交', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FormHarness onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('姓名不能为空')).toBeInTheDocument()
    expect(screen.getByText('邮箱不能为空')).toBeInTheDocument()
  })

  it('错误映射到正确字段，并通过 aria-describedby 关联', async () => {
    const user = userEvent.setup()
    render(<FormHarness onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '保存' }))

    const nameInput = screen.getByLabelText(/姓名/)
    const emailInput = screen.getByLabelText(/邮箱/)

    expect(describedErrorOf(nameInput)).toBe('姓名不能为空')
    expect(describedErrorOf(emailInput)).toBe('邮箱不能为空')
    expect(nameInput).toHaveAttribute('aria-invalid', 'true')
  })

  it('修正内容后该字段的错误即时消失，其余字段错误保留', async () => {
    const user = userEvent.setup()
    render(<FormHarness onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '保存' }))
    await user.type(screen.getByLabelText(/姓名/), '张三')

    expect(screen.queryByText('姓名不能为空')).not.toBeInTheDocument()
    expect(screen.getByText('邮箱不能为空')).toBeInTheDocument()
  })

  it('失焦时校验该字段', async () => {
    const user = userEvent.setup()
    render(<FormHarness onSubmit={vi.fn()} />)

    const emailInput = screen.getByLabelText(/邮箱/)
    await user.click(emailInput)
    await user.type(emailInput, 'abc')
    await user.tab()

    expect(screen.getByText('邮箱格式不正确')).toBeInTheDocument()
  })

  it('校验通过后提交，错误全部清空', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FormHarness onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: '保存' }))
    await user.type(screen.getByLabelText(/姓名/), '张三')
    await user.type(screen.getByLabelText(/邮箱/), 'zhangsan@example.com')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(onSubmit).toHaveBeenCalledWith({ name: '张三', email: 'zhangsan@example.com' })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
