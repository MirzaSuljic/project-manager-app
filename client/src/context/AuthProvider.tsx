import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { UNAUTHORIZED_EVENT } from '../services/apiClient'
import * as authService from '../services/auth.service'
import { clearToken, getToken, setToken } from '../services/tokenStorage'
import type { User } from '../lib/types'
import { AuthContext, type AuthContextValue } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) {
      return
    }

    let active = true

    authService
      .fetchCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
        }
      })
      .catch(() => {
        clearToken()

        if (active) {
          setUser(null)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login({ email, password })
    setToken(result.token)
    setUser(result.user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await authService.register({ name, email, password })
    setToken(result.token)
    setUser(result.user)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
