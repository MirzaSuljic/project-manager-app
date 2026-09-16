import type { Prisma, Task } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import type { CreateTaskInput, TaskQuery, UpdateTaskInput } from '../schemas/task.schema.js'
import { ApiError } from '../utils/ApiError.js'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TaskListResult {
  data: Task[]
  meta: PaginationMeta
}

function buildWhere(userId: string, query: TaskQuery): Prisma.TaskWhereInput {
  return {
    userId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
}

function buildOrderBy(query: TaskQuery): Prisma.TaskOrderByWithRelationInput[] {
  const tieBreaker: Prisma.TaskOrderByWithRelationInput = { id: 'asc' }

  switch (query.sortBy) {
    case 'dueDate':
      return [{ dueDate: { sort: query.order, nulls: 'last' } }, tieBreaker]
    case 'priority':
      return [{ priority: query.order }, tieBreaker]
    case 'title':
      return [{ title: query.order }, tieBreaker]
    default:
      return [{ createdAt: query.order }, tieBreaker]
  }
}

export async function listTasks(userId: string, query: TaskQuery): Promise<TaskListResult> {
  const where = buildWhere(userId, query)

  const [total, data] = await prisma.$transaction([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: buildOrderBy(query),
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ])

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  }
}

export async function getTask(userId: string, id: string): Promise<Task> {
  const task = await prisma.task.findFirst({ where: { id, userId } })

  if (!task) {
    throw ApiError.notFound('Task not found')
  }

  return task
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  return prisma.task.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ?? null,
    },
  })
}

export async function updateTask(
  userId: string,
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  await getTask(userId, id)

  return prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
    },
  })
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  await getTask(userId, id)
  await prisma.task.delete({ where: { id } })
}
