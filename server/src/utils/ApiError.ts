export type FieldErrors = Record<string, string>

export class ApiError extends Error {
  readonly status: number
  readonly fields?: FieldErrors

  constructor(status: number, message: string, fields?: FieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }

  static badRequest(message: string, fields?: FieldErrors): ApiError {
    return new ApiError(400, message, fields)
  }

  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, message)
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message)
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message)
  }
}
