import prisma from '../lib/prisma.js'

export async function listMyAnime(req, res, next) {
  try {
    const list = await prisma.userAnime.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json(list)
  } catch (err) {
    next(err)
  }
}

export async function addAnime(req, res, next) {
  try {
    const { animeId, animeTitle, animeImage, totalEpisodes } = req.validatedBody

    const exists = await prisma.userAnime.findUnique({
      where: { userId_animeId: { userId: req.user.id, animeId } },
    })

    if (exists) {
      const err = new Error('Este anime ya está en tu lista')
      err.statusCode = 409
      throw err
    }

    const entry = await prisma.userAnime.create({
      data: { userId: req.user.id, animeId, animeTitle, animeImage, totalEpisodes },
    })

    res.status(201).json(entry)
  } catch (err) {
    next(err)
  }
}

export async function updateAnime(req, res, next) {
  try {
    const id = parseInt(req.params.id)

    const entry = await prisma.userAnime.findFirst({
      where: { id, userId: req.user.id },
    })

    if (!entry) {
      const err = new Error('Anime no encontrado en tu lista')
      err.statusCode = 404
      throw err
    }

    const updated = await prisma.userAnime.update({
      where: { id },
      data: req.validatedBody,
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function removeAnime(req, res, next) {
  try {
    const id = parseInt(req.params.id)

    const entry = await prisma.userAnime.findFirst({
      where: { id, userId: req.user.id },
    })

    if (!entry) {
      const err = new Error('Anime no encontrado en tu lista')
      err.statusCode = 404
      throw err
    }

    await prisma.userAnime.delete({ where: { id } })

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
