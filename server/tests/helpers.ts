import type { Express } from 'express'
import request from 'supertest'

export interface TestUser {
  id: string
  name: string
  email: string
  token: string
}

let counter = 0

export async function createTestUser(
  app: Express,
  overrides: Partial<{ name: string; email: string; password: string }> = {},
): Promise<TestUser> {
  counter += 1

  const payload = {
    name: overrides.name ?? `Test User ${counter}`,
    email: overrides.email ?? `user${counter}@example.com`,
    password: overrides.password ?? 'Password123',
  }

  const response = await request(app).post('/api/auth/register').send(payload)

  if (response.status !== 201) {
    throw new Error(`createTestUser failed: ${response.status} ${JSON.stringify(response.body)}`)
  }

  return {
    id: response.body.user.id,
    name: response.body.user.name,
    email: response.body.user.email,
    token: response.body.token,
  }
}

export function auth(token: string): [string, string] {
  return ['Authorization', `Bearer ${token}`]
}
