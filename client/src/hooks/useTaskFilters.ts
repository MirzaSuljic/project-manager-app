import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { PRIORITY_VALUES, STATUS_VALUES } from '../lib/labels'
import type { Priority, SortBy, SortOrder, TaskFilters, TaskStatus } from '../lib/types'

export const PAGE_SIZE = 12

const SORT_FIELDS: SortBy[] = ['createdAt', 'dueDate', 'priority', 'title']
const SORT_ORDERS: SortOrder[] = ['asc', 'desc']

function parseOption<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : undefined
}

export interface FilterPatch {
  status?: TaskStatus | undefined
  priority?: Priority | undefined
  search?: string | undefined
  sortBy?: SortBy
  order?: SortOrder
  page?: number
}

export interface UseTaskFiltersResult {
  filters: TaskFilters
  setFilters: (patch: FilterPatch) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

export function useTaskFilters(): UseTaskFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<TaskFilters>(() => {
    const page = Number(searchParams.get('page'))
    const search = searchParams.get('search')?.trim()

    return {
      status: parseOption(searchParams.get('status'), STATUS_VALUES),
      priority: parseOption(searchParams.get('priority'), PRIORITY_VALUES),
      search: search ? search : undefined,
      sortBy: parseOption(searchParams.get('sortBy'), SORT_FIELDS) ?? 'createdAt',
      order: parseOption(searchParams.get('order'), SORT_ORDERS) ?? 'desc',
      page: Number.isInteger(page) && page >= 1 ? page : 1,
      limit: PAGE_SIZE,
    }
  }, [searchParams])

  const setFilters = useCallback(
    (patch: FilterPatch) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)

          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === '') {
              next.delete(key)
            } else {
              next.set(key, String(value))
            }
          }

          if (patch.page === undefined) {
            next.delete('page')
          }

          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.search)

  return { filters, setFilters, clearFilters, hasActiveFilters }
}
