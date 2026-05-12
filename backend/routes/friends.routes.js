import { Router } from 'express'
import { listFriends, listRequests, sendRequest, updateRequest, removeFriend } from '../controllers/friends.controller.js'
import { verifyToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createFriendSchema, updateFriendSchema } from '../schemas/friend.schema.js'

const router = Router()

router.get('/', verifyToken, listFriends)
router.get('/requests', verifyToken, listRequests)
router.post('/', verifyToken, validate(createFriendSchema), sendRequest)
router.patch('/:id', verifyToken, validate(updateFriendSchema), updateRequest)
router.delete('/:id', verifyToken, removeFriend)

export default router
