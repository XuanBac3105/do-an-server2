import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * DTO cho update visibility
 */
export const UpdateVisibilityReqSchema = z.object({
    visibility: z.enum(['public', 'private']),
})
export class UpdateVisibilityReqDto extends createZodDto(UpdateVisibilityReqSchema) {}
