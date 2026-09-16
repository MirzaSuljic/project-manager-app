import type { Request, Response } from 'express'
import type { CreateTaskInput, TaskQuery, UpdateTaskInput } from '../schemas/task.schema.js'
import * as taskService from '../services/task.service.js'

export async function list(_req: Request, res: Response): Promise<void> {
  const result = await taskService.listTasks(
    res.locals.userId as string,
    res.locals.query as TaskQuery,
  )
  res.status(200).json(result)
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const task = await taskService.getTask(res.locals.userId as string, req.params.id as string)
  res.status(200).json({ data: task })
}

export async function create(_req: Request, res: Response): Promise<void> {
  const task = await taskService.createTask(
    res.locals.userId as string,
    res.locals.body as CreateTaskInput,
  )
  res.status(201).json({ data: task })
}

export async function update(req: Request, res: Response): Promise<void> {
  const task = await taskService.updateTask(
    res.locals.userId as string,
    req.params.id as string,
    res.locals.body as UpdateTaskInput,
  )
  res.status(200).json({ data: task })
}

export async function remove(req: Request, res: Response): Promise<void> {
  await taskService.deleteTask(res.locals.userId as string, req.params.id as string)
  res.status(204).send()
}
