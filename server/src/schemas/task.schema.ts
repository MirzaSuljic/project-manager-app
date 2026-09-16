import { z } from 'zod'

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE'])
export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])

const titleSchema = z.string().trim().min(1, 'Title is required').max(200, 'Title is too long')
const descriptionSchema = z.string().trim().max(2000, 'Description is too long').nullish()
const dueDateSchema = z.coerce.date('Enter a valid date').nullish()

export const createTaskSchema = z.strictObject({
  title: titleSchema,
  description: descriptionSchema,
  status: taskStatusSchema.default('TODO'),
  priority: taskPrioritySchema.default('MEDIUM'),
  dueDate: dueDateSchema,
})

export const updateTaskSchema = z
  .strictObject({
    title: titleSchema.optional(),
    description: descriptionSchema,
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: dueDateSchema,
  })
  .refine((value) => Object.keys(value).length > 0, {
    error: 'Provide at least one field to update',
  })

export const taskQuerySchema = z.strictObject({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().trim().min(1).max(200).optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit must be 100 or less').default(20),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskQuery = z.infer<typeof taskQuerySchema>
