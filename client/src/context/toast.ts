import { createContext } from 'react'

export type ToastTone = 'success' | 'error'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

export interface ToastContextValue {
  toasts: Toast[]
  success: (message: string) => void
  error: (message: string) => void
  dismiss: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
