import { z } from 'zod'

export const createFriendSchema = z.object({
  receiverId: z.number().int().positive('ID de usuario requerido').optional(),
  receiverName: z.string().min(1, 'Nombre de usuario requerido').optional(),
}).refine(data => data.receiverId || data.receiverName, {
  message: 'Debes proporcionar receiverId o receiverName',
})

export const updateFriendSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  canSeeStatus: z.boolean().optional(),
})
