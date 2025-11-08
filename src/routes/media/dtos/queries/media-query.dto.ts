import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * DTO cho query params
 */
export const MediaQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    mimeType: z.string().optional(),
    visibility: z.enum(['public', 'private']).optional(),
    includeDeleted: z.coerce.boolean().default(false).optional(),
})
export class MediaQueryDto extends createZodDto(MediaQuerySchema) {}
