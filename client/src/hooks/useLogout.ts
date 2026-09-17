import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useAuth } from './useAuth'

export function useLogout(): () => void {
  const { logout } = useAuth()
  const queryClient = useQueryClient()

  return useCallback(() => {
    logout()
    queryClient.clear()
  }, [logout, queryClient])
}
