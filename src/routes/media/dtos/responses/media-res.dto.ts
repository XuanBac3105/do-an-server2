import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * DTO cho uploader info
 */
export const UploaderResSchema = z.object({
    id: z.number(),
    fullName: z.string(),
    email: z.string().email(),
    role: z.enum(['student', 'admin']),
})
export class UploaderResDto extends createZodDto(UploaderResSchema) {}

/**
 * DTO cho media response
 */
export const MediaResSchema = z.object({
    id: z.number(),
    disk: z.string(),
    bucket: z.string().nullable(),
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
    uploadedBy: z.number().nullable(),
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    url: z.string().optional(), // URL để access file
    uploader: UploaderResSchema.optional(),
})
export class MediaResDto extends createZodDto(MediaResSchema) {}
