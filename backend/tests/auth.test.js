import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import prisma from '../lib/prisma.js'

const testUser = {
  email: 'test@example.com',
  password: '123456',
  name: 'Test',
}

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } })
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } })
  await prisma.$disconnect()
})

describe('Auth', () => {
  it('POST /api/auth/register - 201 success', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.usuario.email).toBe(testUser.email)
  })

  it('POST /api/auth/register - 400 invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'not-an-email' })

    expect(res.status).toBe(400)
  })

  it('POST /api/auth/register - 400 short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, password: '123' })

    expect(res.status).toBe(400)
  })

  it('POST /api/auth/register - 409 duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    expect(res.status).toBe(409)
    expect(res.body.error).toContain('registrado')
  })

  it('POST /api/auth/login - 200 success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('POST /api/auth/login - 401 wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrong' })

    expect(res.status).toBe(401)
  })

  it('POST /api/auth/login - 401 non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: '123456' })

    expect(res.status).toBe(401)
  })
})
