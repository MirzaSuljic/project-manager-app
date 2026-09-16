import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { ApiError, type FieldErrors } from '../utils/ApiError.js'

export type ValidationSource = 'body' | 'params' | 'query'

export function validate(schema: ZodType, source: ValidationSource = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      const fields: FieldErrors = {}

      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || source
        if (fields[key] === undefined) {
          fields[key] = issue.message
        }
      }

      next(ApiError.badRequest('Validation failed', fields))
      return
    }

    res.locals[source] = result.data
    next()
  }
}
