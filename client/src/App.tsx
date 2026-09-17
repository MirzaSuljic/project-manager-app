import { Navigate, Route, Routes } from 'react-router'
import { GuestRoute } from './components/layout/GuestRoute'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import LoginPage from './routes/LoginPage'
import NotFoundPage from './routes/NotFoundPage'
import RegisterPage from './routes/RegisterPage'
import TasksPage from './routes/TasksPage'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/tasks" element={<TasksPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
