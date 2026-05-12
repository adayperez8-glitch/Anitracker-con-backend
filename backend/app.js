import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import animeRoutes from './routes/anime.routes.js'
import friendsRoutes from './routes/friends.routes.js'
import messagesRoutes from './routes/messages.routes.js'
import recommendationsRoutes from './routes/recommendations.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Serve built frontend in production
const frontendDist = path.resolve(__dirname, '../../frontend/dist')
app.use(express.static(frontendDist))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', jwtSet: !!process.env.JWT_SECRET })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/anime', animeRoutes)
app.use('/api/friends', friendsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/recommendations', recommendationsRoutes)

// SPA fallback: serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'))
})

app.use(errorHandler)

export default app
