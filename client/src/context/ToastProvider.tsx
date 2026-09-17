import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ToastContext, type Toast, type ToastContextValue, type ToastTone } from './toast'

const VISIBLE_MS = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (message: string, tone: ToastTone) => {
      const id = Date.now() + Math.random()
      setToasts((current) => [...current, { id, message, tone }])
      window.setTimeout(() => dismiss(id), VISIBLE_MS)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      success: (message: string) => push(message, 'success'),
      error: (message: string) => push(message, 'error'),
      dismiss,
    }),
    [toasts, push, dismiss],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
