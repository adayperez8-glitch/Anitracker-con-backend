export function errorHandler(err, _req, res, _next) {
  console.error(err)

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: err.errors.map((e) => ({
        campo: e.path.join('.'),
        mensaje: e.message,
      })),
    })
  }

  res.status(500).json({ error: 'Error interno del servidor' })
}
