import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * DTO cho upload nhiều files
 */
export const UploadMultipleFilesReqSchema = z.object({
    visibility: z.enum(['public', 'private']).default('private').optional(),
})
export class UploadMultipleFilesReqDto extends createZodDto(UploadMultipleFilesReqSchema) {}
