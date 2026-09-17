import { useEffect, useState } from 'react'
import type { FilterPatch } from '../../hooks/useTaskFilters'
import { PRIORITY_LABELS, PRIORITY_VALUES, STATUS_LABELS, STATUS_VALUES } from '../../lib/labels'
import type { Priority, SortBy, TaskFilters, TaskStatus } from '../../lib/types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

const SORT_LABELS: Record<SortBy, string> = {
  createdAt: 'Created',
  dueDate: 'Due date',
  priority: 'Priority',
  title: 'Title',
}

const SEARCH_DEBOUNCE_MS = 300

interface FilterBarProps {
  filters: TaskFilters
  hasActiveFilters: boolean
  onChange: (patch: FilterPatch) => void
  onClear: () => void
}

export function FilterBar({ filters, hasActiveFilters, onChange, onClear }: FilterBarProps) {
  const [searchText, setSearchText] = useState(filters.search ?? '')
  const [committedSearch, setCommittedSearch] = useState(filters.search ?? '')
  const [expanded, setExpanded] = useState(false)

  if (committedSearch !== (filters.search ?? '')) {
    setCommittedSearch(filters.search ?? '')
    setSearchText(filters.search ?? '')
  }

  useEffect(() => {
    const trimmed = searchText.trim()

    if (trimmed === (filters.search ?? '')) {
      return
    }

    const timer = window.setTimeout(() => {
      onChange({ search: trimmed === '' ? undefined : trimmed })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [searchText, filters.search, onChange])

  return (
    <section className="mb-6 rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          id="task-search"
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search title and description"
          className="sm:flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          className="sm:hidden"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide filters' : 'Show filters'}
        </Button>
      </div>

      <div
        className={`${expanded ? 'grid' : 'hidden'} mt-3 gap-3 sm:mt-3 sm:grid sm:grid-cols-2 lg:grid-cols-4`}
      >
        <Select
          aria-label="Filter by status"
          value={filters.status ?? ''}
          onChange={(event) =>
            onChange({
              status: event.target.value === '' ? undefined : (event.target.value as TaskStatus),
            })
          }
        >
          <option value="">All statuses</option>
          {STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by priority"
          value={filters.priority ?? ''}
          onChange={(event) =>
            onChange({
              priority: event.target.value === '' ? undefined : (event.target.value as Priority),
            })
          }
        >
          <option value="">All priorities</option>
          {PRIORITY_VALUES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Sort by"
          value={filters.sortBy}
          onChange={(event) => onChange({ sortBy: event.target.value as SortBy })}
        >
          {(Object.keys(SORT_LABELS) as SortBy[]).map((field) => (
            <option key={field} value={field}>
              Sort by {SORT_LABELS[field]}
            </option>
          ))}
        </Select>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => onChange({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
          >
            {filters.order === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
          {hasActiveFilters ? (
            <Button type="button" variant="ghost" onClick={onClear}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
