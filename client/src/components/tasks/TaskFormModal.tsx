import { useState, type FormEvent } from 'react'
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks'
import { fromDateInputValue, toDateInputValue } from '../../lib/format'
import { PRIORITY_LABELS, PRIORITY_VALUES, STATUS_LABELS, STATUS_VALUES } from '../../lib/labels'
import { taskFormSchema, toFieldErrors, type TaskFormValues } from '../../lib/schemas'
import type { Task, TaskInput } from '../../lib/types'
import { ApiError } from '../../services/apiClient'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'

const EMPTY_VALUES: TaskFormValues = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
}

function toFormValues(task: Task | null): TaskFormValues {
  if (!task) {
    return EMPTY_VALUES
  }

  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    dueDate: toDateInputValue(task.dueDate),
  }
}

interface TaskFormModalProps {
  task: Task | null
  onClose: () => void
}

export function TaskFormModal({ task, onClose }: TaskFormModalProps) {
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const [values, setValues] = useState<TaskFormValues>(() => toFormValues(task))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const submitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsed = taskFormSchema.safeParse(values)

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      return
    }

    setErrors({})

    const input: TaskInput = {
      title: parsed.data.title,
      description: parsed.data.description === '' ? null : parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: fromDateInputValue(parsed.data.dueDate),
    }

    try {
      if (task) {
        await updateMutation.mutateAsync({ id: task.id, input })
      } else {
        await createMutation.mutateAsync(input)
      }

      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        setErrors(error.fields)
      } else if (error instanceof ApiError) {
        setFormError(error.message)
      } else {
        setFormError('Something went wrong. Try again.')
      }
    }
  }

  return (
    <Modal open title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError ? (
          <p className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
            {formError}
          </p>
        ) : null}

        <Field id="task-title" label="Title" error={errors.title}>
          <Input
            id="task-title"
            value={values.title}
            invalid={Boolean(errors.title)}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="Write the release notes"
          />
        </Field>

        <Field id="task-description" label="Description" error={errors.description}>
          <Textarea
            id="task-description"
            rows={4}
            value={values.description}
            invalid={Boolean(errors.description)}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Optional details"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="task-status" label="Status" error={errors.status}>
            <Select
              id="task-status"
              value={values.status}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  status: event.target.value as TaskFormValues['status'],
                }))
              }
            >
              {STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>

          <Field id="task-priority" label="Priority" error={errors.priority}>
            <Select
              id="task-priority"
              value={values.priority}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  priority: event.target.value as TaskFormValues['priority'],
                }))
              }
            >
              {PRIORITY_VALUES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field id="task-dueDate" label="Due date" error={errors.dueDate}>
          <Input
            id="task-dueDate"
            type="date"
            value={values.dueDate}
            invalid={Boolean(errors.dueDate)}
            onChange={(event) =>
              setValues((current) => ({ ...current, dueDate: event.target.value }))
            }
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {task ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
