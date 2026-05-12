import prisma from '../lib/prisma.js'

export async function listFriends(req, res, next) {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: req.user.id, status: 'ACCEPTED' },
          { receiverId: req.user.id, status: 'ACCEPTED' },
        ],
      },
      include: {
        requester: { select: { id: true, name: true, power: true } },
        receiver: { select: { id: true, name: true, power: true } },
      },
    })

    const friends = friendships.map((f) => {
      const friend = f.requester.id === req.user.id ? f.receiver : f.requester
      return { friendshipId: f.id, user: friend, canSeeStatus: f.canSeeStatus }
    })

    res.json(friends)
  } catch (err) {
    next(err)
  }
}

export async function listRequests(req, res, next) {
  try {
    const requests = await prisma.friendship.findMany({
      where: { receiverId: req.user.id, status: 'PENDING' },
      include: {
        requester: { select: { id: true, name: true, power: true } },
      },
    })

    res.json(requests)
  } catch (err) {
    next(err)
  }
}

export async function sendRequest(req, res, next) {
  try {
    const { receiverId } = req.validatedBody

    if (receiverId === req.user.id) {
      const err = new Error('No puedes enviarte solicitud a ti mismo')
      err.statusCode = 400
      throw err
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
    if (!receiver) {
      const err = new Error('Usuario no encontrado')
      err.statusCode = 404
      throw err
    }

    const exists = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: req.user.id, receiverId },
          { requesterId: receiverId, receiverId: req.user.id },
        ],
      },
    })

    if (exists) {
      const err = new Error('Ya existe una solicitud o amistad con este usuario')
      err.statusCode = 409
      throw err
    }

    const friendship = await prisma.friendship.create({
      data: { requesterId: req.user.id, receiverId },
    })

    res.status(201).json(friendship)
  } catch (err) {
    next(err)
  }
}

export async function updateRequest(req, res, next) {
  try {
    const id = parseInt(req.params.id)
    const { status, canSeeStatus } = req.validatedBody

    const friendship = await prisma.friendship.findFirst({
      where: { id, receiverId: req.user.id, status: 'PENDING' },
    })

    if (!friendship) {
      const err = new Error('Solicitud no encontrada')
      err.statusCode = 404
      throw err
    }

    const updated = await prisma.friendship.update({
      where: { id },
      data: { status, ...(canSeeStatus !== undefined && { canSeeStatus }) },
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export async function removeFriend(req, res, next) {
  try {
    const id = parseInt(req.params.id)

    const friendship = await prisma.friendship.findFirst({
      where: {
        id,
        OR: [
          { requesterId: req.user.id },
          { receiverId: req.user.id },
        ],
      },
    })

    if (!friendship) {
      const err = new Error('Amistad no encontrada')
      err.statusCode = 404
      throw err
    }

    await prisma.friendship.delete({ where: { id } })

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
