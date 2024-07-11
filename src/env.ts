import { z } from 'zod'

const envSchema = z.object({
    DATABASE_URL: z.string(),
    API_BASE_URL: z.string(),
    WEB_BASE_URL: z.string(),
    PORT: z.coerce.number().default(8000)
})


export const env = envSchema.parse(process.env)