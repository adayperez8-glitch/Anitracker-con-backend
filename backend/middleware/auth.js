import jwt from 'jsonwebtoken'

export function verifyToken(req, _res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Token requerido')
    err.statusCode = 401
    throw err
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    const err = new Error('Token inválido o expirado')
    err.statusCode = 401
    throw err
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      const err = new Error('No tienes permisos para esta acción')
      err.statusCode = 403
      throw err
    }
    next()
  }
}
