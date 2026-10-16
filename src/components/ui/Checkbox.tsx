/**
 * 复选框字段。
 *
 * 整行都是 label，因此触控目标远大于 44×44px（AC-X04）；
 * 复选框使用 accent-color 取香槟金，不引入自定义绘制控件。
 */
export function CheckboxField({
  name,
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  name: string
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  const inputId = `field-${name}`
  const hintId = hint ? `${inputId}-hint` : undefined

  return (
    <div data-field={name}>
      <label
        htmlFor={inputId}
        className="flex min-h-11 cursor-pointer items-start gap-3 rounded-control py-1"
      >
        <input
          id={inputId}
          name={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-2 h-5 w-5 shrink-0 cursor-pointer rounded-sm border border-ink-600 accent-champagne-400 focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-parchment-100">{label}</span>
          {hint ? (
            <span id={hintId} className="mt-1 block text-xs leading-5 text-parchment-500">
              {hint}
            </span>
          ) : null}
        </span>
      </label>
    </div>
  )
}
