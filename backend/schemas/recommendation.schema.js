import { z } from 'zod'

export const createRecommendationSchema = z.object({
  animeTitle: z.string().min(1, 'El título es requerido'),
  animeImage: z.string().default(''),
  description: z.string().max(500, 'Descripción demasiado larga').default(''),
})
