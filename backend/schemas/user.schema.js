import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  power: z.string().optional(),
  bio: z.string().max(500).optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
})
