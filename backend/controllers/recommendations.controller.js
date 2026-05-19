import prisma from '../lib/prisma.js'

export async function listRecommendations(req, res, next) {
  try {
    const userId = parseInt(req.params.userId)

    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    res.json(recommendations)
  } catch (err) {
    next(err)
  }
}

export async function addRecommendation(req, res, next) {
  try {
    const { animeTitle, animeImage, description } = req.validatedBody

    const existing = await prisma.recommendation.findFirst({
      where: { userId: req.user.id, animeTitle },
    })

    if (existing) {
      const err = new Error('Ya recomendaste este anime')
      err.statusCode = 409
      throw err
    }

    const recommendation = await prisma.recommendation.create({
      data: { userId: req.user.id, animeTitle, animeImage, description },
    })

    res.status(201).json(recommendation)
  } catch (err) {
    next(err)
  }
}

export async function removeRecommendation(req, res, next) {
  try {
    const id = parseInt(req.params.id)

    const rec = await prisma.recommendation.findFirst({
      where: { id, userId: req.user.id },
    })

    if (!rec) {
      const err = new Error('Recomendación no encontrada')
      err.statusCode = 404
      throw err
    }

    await prisma.recommendation.delete({ where: { id } })

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
