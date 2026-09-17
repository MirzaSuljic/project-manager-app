import type { Priority, TaskStatus } from './types'

export const STATUS_VALUES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']
export const PRIORITY_VALUES: Priority[] = ['LOW', 'MEDIUM', 'HIGH']

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export const STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200',
  DONE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200',
}

export const PRIORITY_DOT_CLASSES: Record<Priority, string> = {
  LOW: 'bg-sky-500',
  MEDIUM: 'bg-amber-500',
  HIGH: 'bg-rose-500',
}

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
}
