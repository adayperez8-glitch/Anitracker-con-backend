import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import prisma from '../lib/prisma.js'

let token
let userId
let recId

const userData = { email: 'rec@test.com', password: '123456', name: 'RecTester' }

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

describe('Recommendations', () => {
  it('POST /api/recommendations - 201 add', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        animeTitle: 'Steins;Gate',
        animeImage: 'https://example.com/sg.jpg',
        description: 'La mejor serie',
      })

    expect(res.status).toBe(201)
    expect(res.body.animeTitle).toBe('Steins;Gate')
    recId = res.body.id
  })

  it('GET /api/recommendations/:userId - 200 list', async () => {
    const res = await request(app)
      .get(`/api/recommendations/${userId}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].animeTitle).toBe('Steins;Gate')
  })

  it('POST /api/recommendations - 400 empty title', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .set('Authorization', `Bearer ${token}`)
      .send({ animeTitle: '' })

    expect(res.status).toBe(400)
  })

  it('DELETE /api/recommendations/:id - 204 remove', async () => {
    const res = await request(app)
      .delete(`/api/recommendations/${recId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })

  it('DELETE /api/recommendations/:id - 404 not found', async () => {
    const res = await request(app)
      .delete(`/api/recommendations/${recId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})
