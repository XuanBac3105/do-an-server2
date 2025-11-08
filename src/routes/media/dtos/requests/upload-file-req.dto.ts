import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * DTO cho upload file
 */
export const UploadFileReqSchema = z.object({
    visibility: z.enum(['public', 'private']).default('private').optional(),
    metadata: z.record(z.string(), z.string()).optional(),
})
export class UploadFileReqDto extends createZodDto(UploadFileReqSchema) {}
