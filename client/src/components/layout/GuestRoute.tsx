import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'

export function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-app">
        <Spinner label="Checking your session" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/tasks" replace />
  }

  return <Outlet />
}
