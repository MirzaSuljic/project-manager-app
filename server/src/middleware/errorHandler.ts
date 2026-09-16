import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`))
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: {
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    })
    return
  }

  if (env.NODE_ENV !== 'test') {
    console.error(error)
  }

  res.status(500).json({ error: { message: 'Internal server error' } })
}
