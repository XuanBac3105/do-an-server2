import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * DTO cho upload response
 */
export const UploadResSchema = z.object({
    id: z.number(),
    disk: z.string(),
    bucket: z.string(),
    objectKey: z.string(),
    mimeType: z.string().nullable(),
    sizeBytes: z
        .union([z.bigint(), z.number(), z.string()])
        .nullable()
        .transform((val) => {
            if (typeof val === 'bigint') return val.toString()
            return val
        }),
    visibility: z.string(),
    url: z.string(),
    createdAt: z.date(),
})
export class UploadResDto extends createZodDto(UploadResSchema) {}
