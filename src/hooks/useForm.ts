import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { z } from 'zod'
import { issuesToFieldErrors, type FieldErrors } from '../lib/validation'

/**
 * 基于 Zod 的表单状态（X-02）。
 *
 * 校验时机：
 * - 字段已有错误时，输入即重新校验，让错误提示即时消失（AC-X02）；
 * - 失焦时校验该字段；
 * - 提交时全量校验，并把焦点移到第一个错误字段。
 *
 * 表单使用同一份 schema 与列表/本地数据校验，因此不会出现"表单通过了但读取报错"。
 */

/** 字段名可能含 `.`（如 socials.0.label），选择器需要转义 */
function escapeAttributeValue(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/["\\]/g, '\\$&')
}

export type UseFormOptions<TInput, TOutput> = {
  schema: z.ZodType<TOutput, TInput>
  initialValues: TInput
  onSubmit: (values: TOutput) => void | Promise<void>
}

export type UseFormResult<TInput> = {
  values: TInput
  errors: FieldErrors
  formError: string | null
  isSubmitting: boolean
  isDirty: boolean
  setValue: <K extends keyof TInput & string>(name: K, value: TInput[K]) => void
  setErrors: (errors: FieldErrors) => void
  setFormError: (message: string | null) => void
  validateField: (name: string) => void
  handleSubmit: (event?: FormEvent) => Promise<void>
  reset: (next: TInput) => void
  focusFirstError: (target?: FieldErrors) => void
}

export function useForm<TInput extends object, TOutput>(
  options: UseFormOptions<TInput, TOutput>,
): UseFormResult<TInput> {
  const { schema, initialValues, onSubmit } = options

  const [values, setValues] = useState<TInput>(initialValues)
  const [errors, setErrorsState] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const valuesRef = useRef<TInput>(initialValues)
  const errorsRef = useRef<FieldErrors>({})
  const initialRef = useRef<TInput>(initialValues)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const collectErrors = useCallback(
    (next: TInput): FieldErrors => {
      const result = schema.safeParse(next)
      return result.success ? {} : issuesToFieldErrors(result.error.issues)
    },
    [schema],
  )

  const setErrors = useCallback((next: FieldErrors) => {
    errorsRef.current = next
    setErrorsState(next)
  }, [])

  const setValue = useCallback(
    <K extends keyof TInput & string>(name: K, value: TInput[K]) => {
      const next = { ...valuesRef.current, [name]: value }
      valuesRef.current = next
      setValues(next)

      // 只在字段本来就有错误时即时重算，避免用户刚打开表单就满屏报错
      if (!(name in errorsRef.current)) return
      const recomputed = collectErrors(next)
      const message = recomputed[name]
      const remaining = { ...errorsRef.current }
      if (message) {
        remaining[name] = message
      } else {
        delete remaining[name]
      }
      setErrors(remaining)
      setFormError(null)
    },
    [collectErrors, setErrors],
  )

  const validateField = useCallback(
    (name: string) => {
      const recomputed = collectErrors(valuesRef.current)
      const message = recomputed[name]
      const remaining = { ...errorsRef.current }
      if (message) {
        remaining[name] = message
      } else {
        delete remaining[name]
      }
      setErrors(remaining)
    },
    [collectErrors, setErrors],
  )

  const focusFirstError = useCallback((target?: FieldErrors) => {
    const source = target ?? errorsRef.current
    const firstKey = Object.keys(source)[0]
    if (firstKey === undefined) return

    const container = document.querySelector<HTMLElement>(
      `[data-field="${escapeAttributeValue(firstKey)}"]`,
    )
    const focusable = container?.querySelector<HTMLElement>(
      'input, textarea, select, button, [tabindex]',
    )
    ;(focusable ?? container)?.focus()
  }, [])

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault()
      const result = schema.safeParse(valuesRef.current)
      if (!result.success) {
        const next = issuesToFieldErrors(result.error.issues)
        setErrors(next)
        setFormError(null)
        focusFirstError(next)
        return
      }

      setErrors({})
      setFormError(null)
      setIsSubmitting(true)
      try {
        await onSubmit(result.data)
      } catch {
        if (mountedRef.current) {
          setFormError('保存失败，请检查填写内容后重试')
        }
      } finally {
        if (mountedRef.current) setIsSubmitting(false)
      }
    },
    [schema, onSubmit, setErrors, focusFirstError],
  )

  const reset = useCallback(
    (next: TInput) => {
      valuesRef.current = next
      setValues(next)
      setErrors({})
      setFormError(null)
    },
    [setErrors],
  )

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialRef.current),
    [values],
  )

  return {
    values,
    errors,
    formError,
    isSubmitting,
    isDirty,
    setValue,
    setErrors,
    setFormError,
    validateField,
    handleSubmit,
    reset,
    focusFirstError,
  }
}
