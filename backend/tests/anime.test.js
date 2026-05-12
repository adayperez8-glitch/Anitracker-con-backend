import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import prisma from '../lib/prisma.js'

let token
let animeId

const testUser = {
  email: 'test-anime@example.com',
  password: '123456',
  name: 'Anime Tester',
}

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } })
  const res = await request(app).post('/api/auth/register').send(testUser)
  token = res.body.token
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } })
  await prisma.$disconnect()
})

describe('AnimeList', () => {
  it('GET /api/anime - 200 empty list', async () => {
    const res = await request(app)
      .get('/api/anime')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('GET /api/anime - 401 without token', async () => {
    const res = await request(app).get('/api/anime')

    expect(res.status).toBe(401)
  })

  it('POST /api/anime - 201 add anime', async () => {
    const res = await request(app)
      .post('/api/anime')
      .set('Authorization', `Bearer ${token}`)
      .send({
        animeId: 21,
        animeTitle: 'One Piece',
        animeImage: 'https://example.com/op.jpg',
        totalEpisodes: 0,
      })

    expect(res.status).toBe(201)
    expect(res.body.animeTitle).toBe('One Piece')
    animeId = res.body.id
  })

  it('POST /api/anime - 409 duplicate', async () => {
    const res = await request(app)
      .post('/api/anime')
      .set('Authorization', `Bearer ${token}`)
      .send({
        animeId: 21,
        animeTitle: 'One Piece',
      })

    expect(res.status).toBe(409)
  })

  it('PATCH /api/anime/:id - 200 update progress', async () => {
    const res = await request(app)
      .patch(`/api/anime/${animeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentEpisode: 500 })

    expect(res.status).toBe(200)
    expect(res.body.currentEpisode).toBe(500)
  })

  it('DELETE /api/anime/:id - 204 remove', async () => {
    const res = await request(app)
      .delete(`/api/anime/${animeId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })
})
