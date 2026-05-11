export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const err = new Error('Datos inválidos')
      err.statusCode = 400
      err.name = 'ZodError'
      err.errors = result.error.errors
      throw err
    }

    req.validatedBody = result.data
    next()
  }
}
