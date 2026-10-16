import { useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { Select } from './Select'

/**
 * 表单字段容器：统一生成 label 关联、错误提示与无障碍属性（AGENTS.md §3.3）。
 *
 * 采用 render prop 把 id 与 aria-describedby 交给控件，
 * 这样原生输入框与自定义控件（如头像上传）都能拿到同一套无障碍关联。
 * 外层带 data-field，useForm 在提交失败时据此把焦点移到第一个错误字段。
 */

export type FieldRenderProps = {
  inputId: string
  describedBy: string | undefined
  invalid: boolean
}

export function FieldGroup({
  name,
  label,
  error,
  hint,
  required,
  children,
}: {
  name: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (props: FieldRenderProps) => ReactNode
}) {
  const inputId = `field-${name}`
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const invalid = Boolean(error)
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter((part) => part !== null).join(' ') ||
    undefined

  return (
    <div data-field={name} className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-parchment-100">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-1 text-danger-400">
              *
            </span>
            <span className="sr-only">（必填）</span>
          </>
        ) : null}
      </label>
      {children({ inputId, describedBy, invalid })}
      {hint && !error ? (
        <p id={hintId} className="text-xs leading-5 text-parchment-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs leading-5 text-danger-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type TextFieldProps = {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  required?: boolean
  type?: 'text' | 'password' | 'email' | 'tel' | 'url' | 'month' | 'date' | 'number'
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  maxLength?: number
}

export function TextField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  type = 'text',
  placeholder,
  autoComplete,
  disabled,
  maxLength,
}: TextFieldProps) {
  return (
    <FieldGroup name={name} label={label} error={error} hint={hint} required={required}>
      {({ inputId, describedBy, invalid }) => (
        <Input
          id={inputId}
          name={inputId}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          maxLength={maxLength}
          aria-describedby={describedBy}
          invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      )}
    </FieldGroup>
  )
}

type TextAreaFieldProps = TextFieldProps & { rows?: number; className?: string }

export function TextAreaField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  placeholder,
  disabled,
  maxLength,
  rows,
  className,
}: TextAreaFieldProps) {
  return (
    <FieldGroup name={name} label={label} error={error} hint={hint} required={required}>
      {({ inputId, describedBy, invalid }) => (
        <Textarea
          id={inputId}
          name={inputId}
          value={value}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          aria-describedby={describedBy}
          invalid={invalid}
          className={className}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      )}
    </FieldGroup>
  )
}

export type SelectOption = { value: string; label: string }

export function SelectField({
  name,
  label,
  value,
  options,
  onChange,
  onBlur,
  error,
  hint,
  required,
  disabled,
}: {
  name: string
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
}) {
  return (
    <FieldGroup name={name} label={label} error={error} hint={hint} required={required}>
      {({ inputId, describedBy, invalid }) => (
        <Select
          id={inputId}
          name={inputId}
          value={value}
          disabled={disabled}
          aria-describedby={describedBy}
          invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}
    </FieldGroup>
  )
}

/** 好用的分隔符：中英文逗号与分号都接受 */
function parseTags(text: string): string[] {
  return text
    .split(/[,，;；]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

/**
 * 标签列表字段：以文本形式编辑字符串数组。
 *
 * 用本地文本状态而不是直接由数组拼回文本，避免用户输入分隔符时被立刻规范化掉；
 * 只有外部传入的值与上一次发出的值不一致时才回写文本（例如表单被重置）。
 */
export function TagListField({
  name,
  label,
  value,
  onChange,
  error,
  hint,
  required,
  placeholder,
  disabled,
}: {
  name: string
  label: string
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  hint?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
}) {
  const joined = value.join('，')
  const [text, setText] = useState(joined)
  const lastEmitted = useRef(joined)

  if (lastEmitted.current !== joined) {
    // 值来自外部（重置 / 编辑目标切换）：同步到文本框
    lastEmitted.current = joined
    setText(joined)
  }

  const handleChange = (next: string) => {
    setText(next)
    const tags = parseTags(next)
    lastEmitted.current = tags.join('，')
    onChange(tags)
  }

  const inputProps: ComponentPropsWithoutRef<'input'> = {
    placeholder: placeholder ?? '用逗号分隔，例如：React，TypeScript',
    disabled,
  }

  return (
    <FieldGroup name={name} label={label} error={error} hint={hint} required={required}>
      {({ inputId, describedBy, invalid }) => (
        <Input
          id={inputId}
          name={inputId}
          value={text}
          aria-describedby={describedBy}
          invalid={invalid}
          onChange={(event) => handleChange(event.target.value)}
          {...inputProps}
        />
      )}
    </FieldGroup>
  )
}
