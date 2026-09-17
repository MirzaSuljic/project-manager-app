import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import { Toaster } from './components/ui/Toaster'
import { AuthProvider } from './context/AuthProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { ToastProvider } from './context/ToastProvider'
import './index.css'
import { UNAUTHORIZED_EVENT } from './services/apiClient'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

window.addEventListener(UNAUTHORIZED_EVENT, () => {
  queryClient.clear()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <App />
              <Toaster />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
