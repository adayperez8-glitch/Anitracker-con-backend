import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import prisma from '../lib/prisma.js'

const webhookSpy = vi.fn()

vi.mock('../lib/webhook.js', () => ({
  sendWebhook: (...args) => webhookSpy(...args),
}))

const testUser = {
  email: 'webhook-test@example.com',
  password: '123456',
  name: 'WebhookTest',
}

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } })
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } })
  await prisma.$disconnect()
})

describe('Webhook', () => {
  it('sendWebhook called on register', async () => {
    webhookSpy.mockClear()

    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    expect(res.status).toBe(201)
    expect(webhookSpy).toHaveBeenCalledOnce()
    const [evento, datos] = webhookSpy.mock.calls[0]
    expect(evento).toBe('user_registered')
    expect(datos.email).toBe(testUser.email)
    expect(datos.name).toBe(testUser.name)
    expect(datos).toHaveProperty('userId')
  })
})
