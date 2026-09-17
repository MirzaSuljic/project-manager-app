export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type SortBy = 'createdAt' | 'dueDate' | 'priority' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TaskListResponse {
  data: Task[]
  meta: PaginationMeta
}

export interface AuthResponse {
  user: User
  token: string
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: Priority
  search?: string
  sortBy: SortBy
  order: SortOrder
  page: number
  limit: number
}

export interface TaskInput {
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  dueDate: string | null
}
