import bcrypt from 'bcryptjs'
import { Priority, TaskStatus } from '../src/generated/prisma/client.js'
import { prisma } from '../src/lib/prisma.js'

const DEMO_EMAIL = 'demo@taskmanager.app'
const DEMO_PASSWORD = 'Demo1234'

function daysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

async function main(): Promise<void> {
  const password = await bcrypt.hash(DEMO_PASSWORD, 12)

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: 'Demo User', password },
  })

  await prisma.task.deleteMany({ where: { userId: user.id } })

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: 'Finish the landing page copy',
        description: 'Rewrite the hero section and the three feature blurbs.',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: daysFromNow(2),
      },
      {
        userId: user.id,
        title: 'Review the pull request from Amina',
        description: 'Focus on the pagination logic in the task service.',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        dueDate: daysFromNow(1),
      },
      {
        userId: user.id,
        title: 'Set up automated database backups',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: daysFromNow(9),
      },
      {
        userId: user.id,
        title: 'Renew the SSL certificate',
        description: 'Expired last week, already handled by the provider.',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        dueDate: daysFromNow(-3),
      },
      {
        userId: user.id,
        title: 'Collect testimonials from the last two clients',
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        dueDate: daysFromNow(21),
      },
      {
        userId: user.id,
        title: 'Update the invoicing spreadsheet',
        description: 'September entries are missing.',
        status: TaskStatus.DONE,
        priority: Priority.MEDIUM,
      },
      {
        userId: user.id,
        title: 'Plan the Q4 content calendar',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        dueDate: daysFromNow(14),
      },
    ],
  })

  console.log(`Seeded ${DEMO_EMAIL} with 7 tasks`)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
