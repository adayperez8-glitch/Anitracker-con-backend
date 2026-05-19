import { Router } from 'express'
import { listMyAnime, addAnime, updateAnime, removeAnime } from '../controllers/anime.controller.js'
import { verifyToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createAnimeSchema, updateAnimeSchema } from '../schemas/anime.schema.js'

const router = Router()

router.get('/', verifyToken, listMyAnime)
router.post('/', verifyToken, validate(createAnimeSchema), addAnime)
router.patch('/:id', verifyToken, validate(updateAnimeSchema), updateAnime)
router.delete('/:id', verifyToken, removeAnime)

export default router
