import type { PaginationMeta } from '../../lib/types'
import { Button } from '../ui/Button'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.totalPages <= 1) {
    return null
  }

  const firstItem = (meta.page - 1) * meta.limit + 1
  const lastItem = Math.min(meta.page * meta.limit, meta.total)

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-3">
      <p className="text-sm text-ink-muted">
        {firstItem}–{lastItem} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-ink-muted">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          type="button"
          variant="secondary"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
