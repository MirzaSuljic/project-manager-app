import { Router } from 'express'
import * as taskController from '../controllers/task.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { validate } from '../middleware/validate.js'
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from '../schemas/task.schema.js'

const router = Router()

router.use(requireAuth)

router.get('/', validate(taskQuerySchema, 'query'), taskController.list)
router.post('/', validate(createTaskSchema), taskController.create)
router.get('/:id', taskController.getOne)
router.patch('/:id', validate(updateTaskSchema), taskController.update)
router.delete('/:id', taskController.remove)

export default router
