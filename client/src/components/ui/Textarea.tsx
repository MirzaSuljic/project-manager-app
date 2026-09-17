import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export function Textarea({ invalid = false, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted ${invalid ? 'border-rose-500' : 'border-line'} ${className}`}
    />
  )
}
