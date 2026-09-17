import type { AuthResponse, User } from '../lib/types'
import { apiRequest } from './apiClient'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export function register(input: RegisterInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: input,
    auth: false,
  })
}

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: input,
    auth: false,
  })
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiRequest<{ user: User }>('/api/auth/me')
  return response.user
}
