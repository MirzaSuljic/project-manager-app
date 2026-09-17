import { isOptimistic } from '../../hooks/useTasks'
import type { Task } from '../../lib/types'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  hasActiveFilters: boolean
  onCreate: () => void
  onClearFilters: () => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onAdvanceStatus: (task: Task) => void
}

function TaskSkeleton() {
  return <div className="h-40 animate-pulse rounded-2xl border border-line bg-surface" />
}

export function TaskList({
  tasks,
  isLoading,
  hasActiveFilters,
  onCreate,
  onClearFilters,
  onEdit,
  onDelete,
  onAdvanceStatus,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    )
  }

  if (tasks.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        title="No tasks match these filters"
        description="Try a different status, priority, or search term."
        action={
          <Button variant="secondary" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No tasks yet"
        description="Create your first task and it will show up here."
        action={<Button onClick={onCreate}>New task</Button>}
      />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          disabled={isOptimistic(task)}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdvanceStatus={onAdvanceStatus}
        />
      ))}
    </div>
  )
}
