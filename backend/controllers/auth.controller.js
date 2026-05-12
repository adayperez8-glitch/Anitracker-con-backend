import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import { sendWebhook } from '../lib/webhook.js'

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.validatedBody

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      const err = new Error('El email ya está registrado')
      err.statusCode = 409
      throw err
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    })

    sendWebhook('user_registered', { userId: user.id, email: user.email, name: user.name })

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      usuario: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validatedBody

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      const err = new Error('Credenciales inválidas')
      err.statusCode = 401
      throw err
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      const err = new Error('Credenciales inválidas')
      err.statusCode = 401
      throw err
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      usuario: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}
