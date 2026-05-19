import { z } from 'zod'

export const createAnimeSchema = z.object({
  animeId: z.number().int().positive('animeId debe ser un número positivo'),
  animeTitle: z.string().min(1, 'El título es requerido'),
  animeImage: z.string().default(''),
  totalEpisodes: z.number().int().min(0).default(0),
})

export const updateAnimeSchema = z.object({
  status: z.enum(['WATCHING', 'COMPLETED', 'PAUSED', 'PENDING']).optional(),
  currentEpisode: z.number().int().min(0).optional(),
  isPublic: z.boolean().optional(),
})
