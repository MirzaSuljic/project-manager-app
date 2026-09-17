import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-app">
        <Spinner label="Checking your session" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
