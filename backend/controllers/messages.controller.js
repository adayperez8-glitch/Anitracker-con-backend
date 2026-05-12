import prisma from '../lib/prisma.js'

export async function getMessages(req, res, next) {
  try {
    const receiverId = req.query.receiverId
      ? parseInt(req.query.receiverId)
      : null

    const where = receiverId
      ? {
          OR: [
            { senderId: req.user.id, receiverId },
            { senderId: receiverId, receiverId: req.user.id },
          ],
        }
      : { receiverId: null }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    res.json(messages)
  } catch (err) {
    next(err)
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { content, receiverId } = req.validatedBody

    if (receiverId) {
      const areFriends = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: req.user.id, receiverId, status: 'ACCEPTED' },
            { requesterId: receiverId, receiverId: req.user.id, status: 'ACCEPTED' },
          ],
        },
      })

      if (!areFriends) {
        const err = new Error('Debes ser amigo para enviar mensajes privados')
        err.statusCode = 403
        throw err
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: receiverId || null,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    res.status(201).json(message)
  } catch (err) {
    next(err)
  }
}
