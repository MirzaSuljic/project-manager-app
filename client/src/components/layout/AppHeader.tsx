import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <h1 className="text-base font-semibold text-ink sm:text-lg">Task Manager</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
