import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task, TaskFilters, TaskInput, TaskListResponse } from '../lib/types'
import { ApiError } from '../services/apiClient'
import { createTask, deleteTask, listTasks, updateTask } from '../services/task.service'
import { useToast } from './useToast'

export const TASKS_KEY = ['tasks'] as const

export const OPTIMISTIC_PREFIX = 'optimistic-'

export function isOptimistic(task: Task): boolean {
  return task.id.startsWith(OPTIMISTIC_PREFIX)
}

type ListEntry = [readonly unknown[], TaskListResponse | undefined]

interface MutationContext {
  previous: ListEntry[]
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

function hasFieldErrors(error: unknown): boolean {
  return error instanceof ApiError && error.fields !== undefined
}

export function useTaskList(filters: TaskFilters) {
  return useQuery({
    queryKey: [...TASKS_KEY, filters],
    queryFn: ({ signal }) => listTasks(filters, signal),
    placeholderData: keepPreviousData,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<Task, unknown, TaskInput, MutationContext>({
    mutationFn: (input) => createTask(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const previous = queryClient.getQueriesData<TaskListResponse>({ queryKey: TASKS_KEY })
      const now = new Date().toISOString()

      const optimistic: Task = {
        ...input,
        id: `${OPTIMISTIC_PREFIX}${now}`,
        userId: 'optimistic',
        createdAt: now,
        updatedAt: now,
      }

      queryClient.setQueriesData<TaskListResponse>({ queryKey: TASKS_KEY }, (current) =>
        current
          ? {
              data: [optimistic, ...current.data],
              meta: { ...current.meta, total: current.meta.total + 1 },
            }
          : current,
      )

      return { previous }
    },
    onError: (error, _input, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value))

      if (!hasFieldErrors(error)) {
        toast.error(errorMessage(error, 'Could not create the task'))
      }
    },
    onSuccess: () => {
      toast.success('Task created')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<Task, unknown, { id: string; input: Partial<TaskInput> }, MutationContext>({
    mutationFn: ({ id, input }) => updateTask(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const previous = queryClient.getQueriesData<TaskListResponse>({ queryKey: TASKS_KEY })
      const now = new Date().toISOString()

      queryClient.setQueriesData<TaskListResponse>({ queryKey: TASKS_KEY }, (current) =>
        current
          ? {
              ...current,
              data: current.data.map((task) =>
                task.id === id ? { ...task, ...input, updatedAt: now } : task,
              ),
            }
          : current,
      )

      return { previous }
    },
    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value))

      if (!hasFieldErrors(error)) {
        toast.error(errorMessage(error, 'Could not update the task'))
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<void, unknown, string, MutationContext>({
    mutationFn: (id) => deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY })
      const previous = queryClient.getQueriesData<TaskListResponse>({ queryKey: TASKS_KEY })

      queryClient.setQueriesData<TaskListResponse>({ queryKey: TASKS_KEY }, (current) =>
        current
          ? {
              data: current.data.filter((task) => task.id !== id),
              meta: { ...current.meta, total: Math.max(0, current.meta.total - 1) },
            }
          : current,
      )

      return { previous }
    },
    onError: (error, _id, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value))
      toast.error(errorMessage(error, 'Could not delete the task'))
    },
    onSuccess: () => {
      toast.success('Task deleted')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_KEY })
    },
  })
}
