import type { TaskStatus } from './types'

export function toDateInputValue(value: string | null): string {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}

export function fromDateInputValue(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function formatDueDate(value: string | null): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString(undefined, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function isOverdue(value: string | null, status: TaskStatus): boolean {
  if (!value || status === 'DONE') {
    return false
  }

  const due = new Date(value)

  if (Number.isNaN(due.getTime())) {
    return false
  }

  const now = new Date()
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const dueUtc = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate())

  return dueUtc < todayUtc
}
