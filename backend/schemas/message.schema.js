import { z } from 'zod'

export const createMessageSchema = z.object({
  content: z.string().min(1, 'El mensaje no puede estar vacío').max(1000, 'Mensaje demasiado largo'),
  receiverId: z.number().int().positive().nullable().optional(),
})
