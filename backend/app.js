import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import animeRoutes from './routes/anime.routes.js'
import friendsRoutes from './routes/friends.routes.js'
import messagesRoutes from './routes/messages.routes.js'
import recommendationsRoutes from './routes/recommendations.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/anime', animeRoutes)
app.use('/api/friends', friendsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/recommendations', recommendationsRoutes)

app.use(errorHandler)

export default app
