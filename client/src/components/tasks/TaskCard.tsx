import { formatDueDate, isOverdue } from '../../lib/format'
import {
  NEXT_STATUS,
  PRIORITY_DOT_CLASSES,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from '../../lib/labels'
import type { Task } from '../../lib/types'
import { Badge } from '../ui/Badge'

interface TaskCardProps {
  task: Task
  disabled: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onAdvanceStatus: (task: Task) => void
}

export function TaskCard({ task, disabled, onEdit, onDelete, onAdvanceStatus }: TaskCardProps) {
  const dueLabel = formatDueDate(task.dueDate)
  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-sm font-semibold text-ink ${task.status === 'DONE' ? 'line-through opacity-70' : ''}`}
        >
          {task.title}
        </h3>
        <span
          title={`${PRIORITY_LABELS[task.priority]} priority`}
          className={`mt-1 size-2.5 shrink-0 rounded-full ${PRIORITY_DOT_CLASSES[task.priority]}`}
        />
      </div>

      {task.description ? (
        <p className="line-clamp-3 text-sm text-ink-muted">{task.description}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge className={STATUS_BADGE_CLASSES[task.status]}>{STATUS_LABELS[task.status]}</Badge>
        <span className="text-xs text-ink-muted">{PRIORITY_LABELS[task.priority]} priority</span>
        {dueLabel ? (
          <span
            className={`text-xs ${overdue ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-ink-muted'}`}
          >
            {overdue ? `Overdue · ${dueLabel}` : `Due ${dueLabel}`}
          </span>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAdvanceStatus(task)}
          className="text-xs font-medium text-accent transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Move to {STATUS_LABELS[NEXT_STATUS[task.status]]}
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onEdit(task)}
            className="text-xs font-medium text-ink-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDelete(task)}
            className="text-xs font-medium text-rose-600 transition hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
