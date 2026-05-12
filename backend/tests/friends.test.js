import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import prisma from '../lib/prisma.js'

let token1, token2
let user1, user2
let friendshipId

const userData1 = { email: 'friend1@test.com', password: '123456', name: 'Friend1' }
const userData2 = { email: 'friend2@test.com', password: '123456', name: 'Friend2' }

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [userData1.email, userData2.email] } } })

  const res1 = await request(app).post('/api/auth/register').send(userData1)
  token1 = res1.body.token
  user1 = res1.body.usuario

  const res2 = await request(app).post('/api/auth/register').send(userData2)
  token2 = res2.body.token
  user2 = res2.body.usuario
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [userData1.email, userData2.email] } } })
  await prisma.$disconnect()
})

describe('Friends', () => {
  it('POST /api/friends - 201 send request', async () => {
    const res = await request(app)
      .post('/api/friends')
      .set('Authorization', `Bearer ${token1}`)
      .send({ receiverId: user2.id })

    expect(res.status).toBe(201)
    expect(res.body.requesterId).toBe(user1.id)
    friendshipId = res.body.id
  })

  it('POST /api/friends - 400 self request', async () => {
    const res = await request(app)
      .post('/api/friends')
      .set('Authorization', `Bearer ${token1}`)
      .send({ receiverId: user1.id })

    expect(res.status).toBe(400)
  })

  it('GET /api/friends/requests - 200 list pending', async () => {
    const res = await request(app)
      .get('/api/friends/requests')
      .set('Authorization', `Bearer ${token2}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].requester.name).toBe('Friend1')
  })

  it('PATCH /api/friends/:id - 200 accept', async () => {
    const res = await request(app)
      .patch(`/api/friends/${friendshipId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ status: 'ACCEPTED', canSeeStatus: true })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ACCEPTED')
  })

  it('GET /api/friends - 200 list friends', async () => {
    const res = await request(app)
      .get('/api/friends')
      .set('Authorization', `Bearer ${token1}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].user.name).toBe('Friend2')
  })

  it('DELETE /api/friends/:id - 204 remove', async () => {
    const res = await request(app)
      .delete(`/api/friends/${friendshipId}`)
      .set('Authorization', `Bearer ${token1}`)

    expect(res.status).toBe(204)
  })
})
