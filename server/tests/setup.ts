import { afterAll, beforeEach } from 'vitest'
import { prisma } from '../src/lib/prisma.js'

beforeEach(async () => {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Task", "User" RESTART IDENTITY CASCADE')
})

afterAll(async () => {
  await prisma.$disconnect()
})
