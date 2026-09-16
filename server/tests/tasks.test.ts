import type { Express } from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { auth, createTestUser, type TestUser } from './helpers.js'

let app: Express

beforeAll(() => {
  app = createApp()
})

async function createTask(user: TestUser, overrides: Record<string, unknown> = {}) {
  const response = await request(app)
    .post('/api/tasks')
    .set(...auth(user.token))
    .send({ title: 'Write the plan', ...overrides })

  expect(response.status).toBe(201)

  return response.body.data
}

describe('authentication guard', () => {
  it('rejects every task route without a token', async () => {
    const responses = await Promise.all([
      request(app).get('/api/tasks'),
      request(app).post('/api/tasks').send({ title: 'x' }),
      request(app).get('/api/tasks/abc'),
      request(app).patch('/api/tasks/abc').send({ title: 'x' }),
      request(app).delete('/api/tasks/abc'),
    ])

    for (const response of responses) {
      expect(response.status).toBe(401)
    }
  })
})

describe('task lifecycle', () => {
  it('creates a task with defaults applied', async () => {
    const user = await createTestUser(app)

    const response = await request(app)
      .post('/api/tasks')
      .set(...auth(user.token))
      .send({ title: 'Ship the API' })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      title: 'Ship the API',
      status: 'TODO',
      priority: 'MEDIUM',
      description: null,
      dueDate: null,
    })
  })

  it('stores every provided field', async () => {
    const user = await createTestUser(app)

    const response = await request(app)
      .post('/api/tasks')
      .set(...auth(user.token))
      .send({
        title: 'Deploy to Railway',
        description: 'Set env vars first',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2026-12-31T00:00:00.000Z',
      })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      description: 'Set env vars first',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    })
    expect(response.body.data.dueDate).toBe('2026-12-31T00:00:00.000Z')
  })

  it('rejects a task with no title', async () => {
    const user = await createTestUser(app)

    const response = await request(app)
      .post('/api/tasks')
      .set(...auth(user.token))
      .send({ description: 'no title here' })

    expect(response.status).toBe(400)
    expect(response.body.error.fields.title).toBeDefined()
  })

  it('reads a task back by id', async () => {
    const user = await createTestUser(app)
    const task = await createTask(user)

    const response = await request(app)
      .get(`/api/tasks/${task.id}`)
      .set(...auth(user.token))

    expect(response.status).toBe(200)
    expect(response.body.data.id).toBe(task.id)
  })

  it('returns 404 for a task id that does not exist', async () => {
    const user = await createTestUser(app)

    const response = await request(app)
      .get('/api/tasks/does-not-exist')
      .set(...auth(user.token))

    expect(response.status).toBe(404)
  })

  it('updates a task', async () => {
    const user = await createTestUser(app)
    const task = await createTask(user)

    const response = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(...auth(user.token))
      .send({ status: 'DONE', priority: 'LOW' })

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      status: 'DONE',
      priority: 'LOW',
      title: 'Write the plan',
    })
  })

  it('clears a due date when sent null', async () => {
    const user = await createTestUser(app)
    const task = await createTask(user, { dueDate: '2026-10-01T00:00:00.000Z' })

    const response = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(...auth(user.token))
      .send({ dueDate: null })

    expect(response.status).toBe(200)
    expect(response.body.data.dueDate).toBeNull()
  })

  it('rejects an empty update body', async () => {
    const user = await createTestUser(app)
    const task = await createTask(user)

    const response = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(...auth(user.token))
      .send({})

    expect(response.status).toBe(400)
  })

  it('deletes a task', async () => {
    const user = await createTestUser(app)
    const task = await createTask(user)

    const deleteResponse = await request(app)
      .delete(`/api/tasks/${task.id}`)
      .set(...auth(user.token))
    expect(deleteResponse.status).toBe(204)

    const readResponse = await request(app)
      .get(`/api/tasks/${task.id}`)
      .set(...auth(user.token))
    expect(readResponse.status).toBe(404)
  })
})

describe('per-user isolation', () => {
  it('lists only the calling user tasks', async () => {
    const alice = await createTestUser(app, { email: 'alice@example.com' })
    const bob = await createTestUser(app, { email: 'bob@example.com' })
    await createTask(alice, { title: 'Alice task' })
    await createTask(bob, { title: 'Bob task' })

    const response = await request(app)
      .get('/api/tasks')
      .set(...auth(alice.token))

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].title).toBe('Alice task')
  })

  it('returns 404 rather than 403 when reading another user task', async () => {
    const alice = await createTestUser(app, { email: 'alice2@example.com' })
    const bob = await createTestUser(app, { email: 'bob2@example.com' })
    const bobTask = await createTask(bob, { title: 'Bob private' })

    const response = await request(app)
      .get(`/api/tasks/${bobTask.id}`)
      .set(...auth(alice.token))

    expect(response.status).toBe(404)
  })

  it('refuses to update another user task', async () => {
    const alice = await createTestUser(app, { email: 'alice3@example.com' })
    const bob = await createTestUser(app, { email: 'bob3@example.com' })
    const bobTask = await createTask(bob, { title: 'Bob private' })

    const response = await request(app)
      .patch(`/api/tasks/${bobTask.id}`)
      .set(...auth(alice.token))
      .send({ title: 'Hijacked' })

    expect(response.status).toBe(404)

    const stillIntact = await request(app)
      .get(`/api/tasks/${bobTask.id}`)
      .set(...auth(bob.token))
    expect(stillIntact.body.data.title).toBe('Bob private')
  })

  it('refuses to delete another user task', async () => {
    const alice = await createTestUser(app, { email: 'alice4@example.com' })
    const bob = await createTestUser(app, { email: 'bob4@example.com' })
    const bobTask = await createTask(bob, { title: 'Bob private' })

    const response = await request(app)
      .delete(`/api/tasks/${bobTask.id}`)
      .set(...auth(alice.token))

    expect(response.status).toBe(404)

    const stillThere = await request(app)
      .get(`/api/tasks/${bobTask.id}`)
      .set(...auth(bob.token))
    expect(stillThere.status).toBe(200)
  })
})

describe('filtering, sorting and pagination', () => {
  it('filters by status', async () => {
    const user = await createTestUser(app)
    await createTask(user, { title: 'A', status: 'TODO' })
    await createTask(user, { title: 'B', status: 'DONE' })

    const response = await request(app)
      .get('/api/tasks?status=DONE')
      .set(...auth(user.token))

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].title).toBe('B')
  })

  it('filters by priority', async () => {
    const user = await createTestUser(app)
    await createTask(user, { title: 'A', priority: 'LOW' })
    await createTask(user, { title: 'B', priority: 'HIGH' })

    const response = await request(app)
      .get('/api/tasks?priority=HIGH')
      .set(...auth(user.token))

    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].title).toBe('B')
  })

  it('searches title and description case-insensitively', async () => {
    const user = await createTestUser(app)
    await createTask(user, { title: 'Refactor API layer' })
    await createTask(user, { title: 'Buy milk', description: 'Also refactor the fridge' })
    await createTask(user, { title: 'Unrelated' })

    const response = await request(app)
      .get('/api/tasks?search=REFACTOR')
      .set(...auth(user.token))

    expect(response.body.data).toHaveLength(2)
  })

  it('sorts by priority descending with HIGH first', async () => {
    const user = await createTestUser(app)
    await createTask(user, { title: 'low', priority: 'LOW' })
    await createTask(user, { title: 'high', priority: 'HIGH' })
    await createTask(user, { title: 'medium', priority: 'MEDIUM' })

    const response = await request(app)
      .get('/api/tasks?sortBy=priority&order=desc')
      .set(...auth(user.token))

    expect(response.body.data.map((task: { priority: string }) => task.priority)).toEqual([
      'HIGH',
      'MEDIUM',
      'LOW',
    ])
  })

  it('returns correct pagination metadata', async () => {
    const user = await createTestUser(app)
    for (let index = 0; index < 5; index += 1) {
      await createTask(user, { title: `Task ${index}` })
    }

    const response = await request(app)
      .get('/api/tasks?page=2&limit=2')
      .set(...auth(user.token))

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(2)
    expect(response.body.meta).toEqual({ page: 2, limit: 2, total: 5, totalPages: 3 })
  })

  it('returns an empty page with correct metadata when there are no tasks', async () => {
    const user = await createTestUser(app)

    const response = await request(app)
      .get('/api/tasks')
      .set(...auth(user.token))

    expect(response.status).toBe(200)
    expect(response.body.data).toEqual([])
    expect(response.body.meta).toEqual({ page: 1, limit: 20, total: 0, totalPages: 1 })
  })

  it('rejects an unknown query parameter', async () => {
    const user = await createTestUser(app)

    const response = await request(app)
      .get('/api/tasks?statuss=DONE')
      .set(...auth(user.token))

    expect(response.status).toBe(400)
  })

  it('rejects a limit above the maximum', async () => {
    const user = await createTestUser(app)

    const response = await request(app)
      .get('/api/tasks?limit=500')
      .set(...auth(user.token))

    expect(response.status).toBe(400)
    expect(response.body.error.fields.limit).toBeDefined()
  })

  it('rejects an invalid status value', async () => {
    const user = await createTestUser(app)

    const response = await request(app)
      .get('/api/tasks?status=ARCHIVED')
      .set(...auth(user.token))

    expect(response.status).toBe(400)
  })
})
