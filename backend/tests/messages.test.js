import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import prisma from '../lib/prisma.js'

let token
let userId

const userData = { email: 'msg@test.com', password: '123456', name: 'MsgTester' }

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: userData.email } })
  const res = await request(app).post('/api/auth/register').send(userData)
  token = res.body.token
  userId = res.body.usuario.id
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: userData.email } })
  await prisma.$disconnect()
})

describe('Messages', () => {
  it('POST /api/messages - 201 send to general', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hola a todos!' })

    expect(res.status).toBe(201)
    expect(res.body.content).toBe('Hola a todos!')
    expect(res.body.receiverId).toBeNull()
  })

  it('GET /api/messages - 200 list general', async () => {
    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
  })

  it('POST /api/messages - 400 empty content', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '' })

    expect(res.status).toBe(400)
  })

  it('POST /api/messages - 403 private to non-friend', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hola!', receiverId: 99999 })

    expect(res.status).toBe(403)
  })

  it('GET /api/messages - 401 without token', async () => {
    const res = await request(app).get('/api/messages')

    expect(res.status).toBe(401)
  })
})
