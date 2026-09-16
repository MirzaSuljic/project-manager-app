import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { auth, createTestUser } from './helpers.js'

let app: Express

beforeAll(() => {
  app = createApp()
})

describe('POST /api/auth/register', () => {
  it('creates an account and returns a token', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Mirza Suljic',
      email: 'Mirza@Example.com',
      password: 'Password123',
    })

    expect(response.status).toBe(201)
    expect(response.body.user).toMatchObject({ name: 'Mirza Suljic', email: 'mirza@example.com' })
    expect(response.body.user.password).toBeUndefined()
    expect(typeof response.body.token).toBe('string')
  })

  it('rejects a duplicate email with 409', async () => {
    const payload = { name: 'First', email: 'dup@example.com', password: 'Password123' }
    await request(app).post('/api/auth/register').send(payload)

    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...payload, name: 'Second' })

    expect(response.status).toBe(409)
    expect(response.body.error.message).toMatch(/already exists/i)
  })

  it('rejects a weak password with a field error', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Weak',
      email: 'weak@example.com',
      password: 'short',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.fields.password).toBeDefined()
  })

  it('rejects an invalid email with a field error', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'Password123',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.fields.email).toBeDefined()
  })
})

describe('POST /api/auth/login', () => {
  it('returns a token for correct credentials', async () => {
    await createTestUser(app, { email: 'login@example.com', password: 'Password123' })

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Password123' })

    expect(response.status).toBe(200)
    expect(typeof response.body.token).toBe('string')
    expect(response.body.user.email).toBe('login@example.com')
  })

  it('returns 401 for a wrong password', async () => {
    await createTestUser(app, { email: 'wrongpass@example.com', password: 'Password123' })

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrongpass@example.com', password: 'Password999' })

    expect(response.status).toBe(401)
  })

  it('returns the same message for an unknown email as for a wrong password', async () => {
    await createTestUser(app, { email: 'known@example.com', password: 'Password123' })

    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123' })
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'known@example.com', password: 'Password999' })

    expect(unknown.status).toBe(401)
    expect(unknown.body.error.message).toBe(wrongPassword.body.error.message)
  })
})

describe('GET /api/auth/me', () => {
  it('returns the authenticated user', async () => {
    const user = await createTestUser(app)

    const response = await request(app).get('/api/auth/me').set(...auth(user.token))

    expect(response.status).toBe(200)
    expect(response.body.user.id).toBe(user.id)
  })

  it('returns 401 without a token', async () => {
    const response = await request(app).get('/api/auth/me')

    expect(response.status).toBe(401)
  })

  it('returns 401 for a malformed token', async () => {
    const response = await request(app).get('/api/auth/me').set(...auth('not-a-real-token'))

    expect(response.status).toBe(401)
  })
})

describe('unknown routes', () => {
  it('returns 404 in the standard error envelope', async () => {
    const response = await request(app).get('/api/nope')

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBeDefined()
  })
})
