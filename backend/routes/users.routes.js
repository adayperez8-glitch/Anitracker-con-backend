import { Router } from 'express'
import { listUsers, getProfile, getMe, updateMe, deleteUser } from '../controllers/users.controller.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { updateUserSchema } from '../schemas/user.schema.js'

const router = Router()

router.get('/', verifyToken, listUsers)
router.get('/me', verifyToken, getMe)
router.patch('/me', verifyToken, validate(updateUserSchema), updateMe)
router.get('/:id', getProfile)
router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteUser)

export default router
