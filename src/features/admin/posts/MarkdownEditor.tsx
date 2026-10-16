import { useEffect, useId, useState } from 'react'
import { MARKDOWN_PREVIEW_DEBOUNCE_MS } from '../../../lib/constants'
import { controlClass } from '../../../components/ui/control-styles'
import { MarkdownView } from '../../../components/MarkdownView'

/**
 * Markdown 编辑器（F-18）：左侧输入、右侧预览，移动端上下堆叠（AC-X04）。
 *
 * 输入使用组件本地状态（由父级持有），预览在停止输入约 200ms 后更新，
 * 避免每次按键都重新渲染整棵 Markdown 树（TECH_DESIGN §10.2）。
 */
export function MarkdownEditor({
  value,
  onChange,
  error,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  const [preview, setPreview] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setPreview(value), MARKDOWN_PREVIEW_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [value])

  return (
    <div data-field="content" className="grid gap-4 lg:grid-cols-2">
      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-parchment-100">
          正文（Markdown）
          <span aria-hidden="true" className="ml-1 text-danger-400">
            *
          </span>
          <span className="sr-only">（必填）</span>
        </label>
        <textarea
          id={inputId}
          name={inputId}
          value={value}
          disabled={disabled}
          rows={22}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={controlClass({ invalid: Boolean(error), className: 'font-mono leading-6' })}
          placeholder={'## 小标题\n\n正文段落，支持列表、代码块与表格。'}
        />
        {error ? (
          <p id={errorId} role="alert" className="mt-1.5 text-xs leading-5 text-danger-400">
            {error}
          </p>
        ) : (
          <p className="mt-1.5 text-xs leading-5 text-parchment-500">
            支持标题、列表、代码块、表格与引用。脚本与原始 HTML 不会被执行，只会以文本显示。
          </p>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-parchment-100">预览</p>
        <div
          role="region"
          aria-label="Markdown 预览"
          className="max-h-[36rem] overflow-y-auto rounded-control border border-ink-700 bg-ink-900 p-4"
        >
          {preview.trim().length === 0 ? (
            <p className="text-sm text-parchment-500">开始输入后，这里会显示渲染结果。</p>
          ) : (
            <MarkdownView content={preview} />
          )}
        </div>
      </div>
    </div>
  )
}
