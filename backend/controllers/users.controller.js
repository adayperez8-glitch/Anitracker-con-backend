import prisma from '../lib/prisma.js'

export async function listUsers(req, res, next) {
  try {
    const { power } = req.query
    const where = power ? { power } : {}

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, power: true, bio: true, role: true },
      orderBy: { name: 'asc' },
    })

    res.json(users)
  } catch (err) {
    next(err)
  }
}

export async function getProfile(req, res, next) {
  try {
    const userId = parseInt(req.params.id)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, power: true, bio: true, role: true,
        animeList: {
          where: { isPublic: true },
          select: { id: true, animeId: true, animeTitle: true, animeImage: true, status: true, currentEpisode: true, totalEpisodes: true },
          orderBy: { createdAt: 'desc' },
        },
        recommendations: {
          select: { id: true, animeTitle: true, animeImage: true, description: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      const err = new Error('Usuario no encontrado')
      err.statusCode = 404
      throw err
    }

    res.json(user)
  } catch (err) {
    next(err)
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, name: true, power: true, bio: true, role: true,
        animeList: {
          select: { id: true, animeId: true, animeTitle: true, animeImage: true, status: true, currentEpisode: true, totalEpisodes: true, isPublic: true },
          orderBy: { createdAt: 'desc' },
        },
        recommendations: {
          select: { id: true, animeTitle: true, animeImage: true, description: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    res.json(user)
  } catch (err) {
    next(err)
  }
}

export async function updateMe(req, res, next) {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.validatedBody,
      select: { id: true, email: true, name: true, power: true, bio: true, role: true },
    })

    res.json(user)
  } catch (err) {
    next(err)
  }
}
