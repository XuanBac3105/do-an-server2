import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { MediaResSchema } from './media-res.dto'

/**
 * DTO cho paginated response
 */
export const PaginatedMediaResSchema = z.object({
    data: z.array(MediaResSchema),
    meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
    }),
})
export class PaginatedMediaResDto extends createZodDto(PaginatedMediaResSchema) {}
