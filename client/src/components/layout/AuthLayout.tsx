import type { ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-app">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-sm font-semibold text-ink">Task Manager</span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-ink-muted">{subtitle}</p>
          {children}
          <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>
        </div>
      </main>
    </div>
  )
}
