import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-app px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">404</p>
      <h1 className="text-2xl font-semibold text-ink">This page does not exist</h1>
      <Link to="/tasks" className="font-medium text-accent hover:underline">
        Back to your tasks
      </Link>
    </div>
  )
}
