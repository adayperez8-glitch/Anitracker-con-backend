import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  power: z.string().optional(),
  bio: z.string().max(500).optional(),
})
