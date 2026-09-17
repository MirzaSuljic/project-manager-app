import type { Task } from '../../lib/types'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface DeleteTaskDialogProps {
  task: Task | null
  onCancel: () => void
  onConfirm: (task: Task) => void
}

export function DeleteTaskDialog({ task, onCancel, onConfirm }: DeleteTaskDialogProps) {
  return (
    <Modal open={task !== null} title="Delete task" onClose={onCancel}>
      <p className="text-sm text-ink-muted">
        {task ? `"${task.title}" will be permanently deleted. This cannot be undone.` : ''}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => {
            if (task) {
              onConfirm(task)
            }
          }}
        >
          Delete task
        </Button>
      </div>
    </Modal>
  )
}
