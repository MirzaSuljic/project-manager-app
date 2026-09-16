import type { Request, Response } from 'express'
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js'
import * as authService from '../services/auth.service.js'

export async function register(_req: Request, res: Response): Promise<void> {
  const result = await authService.register(res.locals.body as RegisterInput)
  res.status(201).json(result)
}

export async function login(_req: Request, res: Response): Promise<void> {
  const result = await authService.login(res.locals.body as LoginInput)
  res.status(200).json(result)
}

export async function me(_req: Request, res: Response): Promise<void> {
  const user = await authService.getUserById(res.locals.userId as string)
  res.status(200).json({ user })
}
