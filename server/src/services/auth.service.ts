import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { Prisma } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js'
import { ApiError } from '../utils/ApiError.js'

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} satisfies Prisma.UserSelect

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>

export interface AuthResult {
  user: PublicUser
  token: string
}

const PASSWORD_ROUNDS = 12

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const password = await bcrypt.hash(input.password, PASSWORD_ROUNDS)

  try {
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, password },
      select: publicUserSelect,
    })

    return { user, token: signToken(user.id) }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw ApiError.conflict('An account with this email already exists')
    }

    throw error
  }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  const passwordMatches = user ? await bcrypt.compare(input.password, user.password) : false

  if (!user || !passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token: signToken(user.id),
  }
}

export async function getUserById(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect })

  if (!user) {
    throw ApiError.unauthorized('Account no longer exists')
  }

  return user
}
