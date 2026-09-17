import type { Task, TaskFilters, TaskInput, TaskListResponse } from '../lib/types'
import { apiRequest } from './apiClient'

export function buildTaskQuery(filters: TaskFilters): string {
  const params = new URLSearchParams()

  if (filters.status) {
    params.set('status', filters.status)
  }

  if (filters.priority) {
    params.set('priority', filters.priority)
  }

  if (filters.search) {
    params.set('search', filters.search)
  }

  params.set('sortBy', filters.sortBy)
  params.set('order', filters.order)
  params.set('page', String(filters.page))
  params.set('limit', String(filters.limit))

  return params.toString()
}

export function listTasks(filters: TaskFilters, signal?: AbortSignal): Promise<TaskListResponse> {
  return apiRequest<TaskListResponse>(`/api/tasks?${buildTaskQuery(filters)}`, { signal })
}

export async function createTask(input: TaskInput): Promise<Task> {
  const response = await apiRequest<{ data: Task }>('/api/tasks', { method: 'POST', body: input })
  return response.data
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const response = await apiRequest<{ data: Task }>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: input,
  })
  return response.data
}

export function deleteTask(id: string): Promise<void> {
  return apiRequest<void>(`/api/tasks/${id}`, { method: 'DELETE' })
}
