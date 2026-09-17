import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ invalid = false, className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted ${invalid ? 'border-rose-500' : 'border-line'} ${className}`}
    />
  )
}
