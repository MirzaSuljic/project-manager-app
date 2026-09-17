import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLogout } from '../../hooks/useLogout'

export function UserMenu() {
  const { user } = useAuth()
  const logout = useLogout()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [open])

  if (!user) {
    return null
  }

  const initials = user.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink transition hover:bg-app"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-on-accent">
          {initials}
        </span>
        <span className="hidden sm:inline">{user.name}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="w-full px-4 py-3 text-left text-sm text-ink transition hover:bg-app"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
