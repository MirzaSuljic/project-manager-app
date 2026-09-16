import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    next(ApiError.unauthorized())
    return
  }

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET)

    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      next(ApiError.unauthorized('Invalid token'))
      return
    }

    res.locals.userId = payload.sub
    next()
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'))
  }
}
