import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'

export function createApp(): Express {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: Array.from(new Set([env.CLIENT_URL, 'http://localhost:5173'])),
      credentials: false,
    }),
  )
  app.use(express.json({ limit: '100kb' }))

  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/auth', authRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
