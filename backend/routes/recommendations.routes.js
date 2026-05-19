import { Router } from 'express'
import { listRecommendations, addRecommendation, removeRecommendation } from '../controllers/recommendations.controller.js'
import { verifyToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createRecommendationSchema } from '../schemas/recommendation.schema.js'

const router = Router()

router.get('/:userId', listRecommendations)
router.post('/', verifyToken, validate(createRecommendationSchema), addRecommendation)
router.delete('/:id', verifyToken, removeRecommendation)

export default router
