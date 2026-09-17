import { useToast } from '../../hooks/useToast'

const TONE_CLASSES = {
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100',
  error:
    'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100',
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${TONE_CLASSES[toast.tone]}`}
        >
          <p className="flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
