import { useState } from 'react'
import { AppHeader } from '../components/layout/AppHeader'
import { DeleteTaskDialog } from '../components/tasks/DeleteTaskDialog'
import { FilterBar } from '../components/tasks/FilterBar'
import { Pagination } from '../components/tasks/Pagination'
import { TaskFormModal } from '../components/tasks/TaskFormModal'
import { TaskList } from '../components/tasks/TaskList'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useTaskFilters } from '../hooks/useTaskFilters'
import { useDeleteTask, useTaskList, useUpdateTask } from '../hooks/useTasks'
import { NEXT_STATUS } from '../lib/labels'
import type { Task } from '../lib/types'

export default function TasksPage() {
  const { user } = useAuth()
  const { filters, setFilters, clearFilters, hasActiveFilters } = useTaskFilters()
  const { data, isPending, isError, error, refetch } = useTaskList(filters)
  const updateMutation = useUpdateTask()
  const deleteMutation = useDeleteTask()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  const openCreate = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const advanceStatus = (task: Task) => {
    updateMutation.mutate({ id: task.id, input: { status: NEXT_STATUS[task.status] } })
  }

  const confirmDelete = (task: Task) => {
    deleteMutation.mutate(task.id)
    setTaskToDelete(null)
  }

  return (
    <div className="min-h-full bg-app">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {user ? `${user.name.split(' ')[0]}'s tasks` : 'Your tasks'}
            </h2>
            <p className="text-sm text-ink-muted">
              {data ? `${data.meta.total} ${data.meta.total === 1 ? 'task' : 'tasks'}` : 'Loading…'}
            </p>
          </div>
          <Button onClick={openCreate}>New task</Button>
        </div>

        <FilterBar
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onChange={setFilters}
          onClear={clearFilters}
        />

        {isError ? (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-6 text-center dark:border-rose-400/30 dark:bg-rose-400/10">
            <p className="text-sm text-rose-800 dark:text-rose-200">
              {error instanceof Error ? error.message : 'Could not load your tasks.'}
            </p>
            <Button variant="secondary" className="mt-3" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <TaskList
              tasks={data?.data ?? []}
              isLoading={isPending}
              hasActiveFilters={hasActiveFilters}
              onCreate={openCreate}
              onClearFilters={clearFilters}
              onEdit={openEdit}
              onDelete={setTaskToDelete}
              onAdvanceStatus={advanceStatus}
            />

            {data ? (
              <Pagination meta={data.meta} onPageChange={(page) => setFilters({ page })} />
            ) : null}
          </>
        )}
      </main>

      {formOpen ? (
        <TaskFormModal
          key={editingTask?.id ?? 'new'}
          task={editingTask}
          onClose={() => setFormOpen(false)}
        />
      ) : null}
      <DeleteTaskDialog
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
