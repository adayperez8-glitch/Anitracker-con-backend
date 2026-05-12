import { z } from 'zod'

export const createFriendSchema = z.object({
  receiverId: z.number().int().positive('ID de usuario requerido'),
})

export const updateFriendSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  canSeeStatus: z.boolean().optional(),
})
