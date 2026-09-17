import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink transition hover:bg-app"
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
