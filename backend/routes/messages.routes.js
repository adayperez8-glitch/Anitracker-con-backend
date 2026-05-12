import { Router } from 'express'
import { getMessages, sendMessage } from '../controllers/messages.controller.js'
import { verifyToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createMessageSchema } from '../schemas/message.schema.js'

const router = Router()

router.get('/', verifyToken, getMessages)
router.post('/', verifyToken, validate(createMessageSchema), sendMessage)

export default router
