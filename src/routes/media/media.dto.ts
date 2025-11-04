import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// ============================================
// Request DTOs
// ============================================

/**
 * DTO cho upload file
 */
export const UploadFileReqSchema = z.object({
    visibility: z.enum(['public', 'private']).default('private').optional(),
    metadata: z.record(z.string(), z.string()).optional(),
})
export class UploadFileReqDto extends createZodDto(UploadFileReqSchema) {}

/**
 * DTO cho upload nhiều files
 */
export const UploadMultipleFilesReqSchema = z.object({
    visibility: z.enum(['public', 'private']).default('private').optional(),
})
export class UploadMultipleFilesReqDto extends createZodDto(UploadMultipleFilesReqSchema) {}

/**
 * DTO cho update visibility
 */
export const UpdateVisibilityReqSchema = z.object({
    visibility: z.enum(['public', 'private']),
})
export class UpdateVisibilityReqDto extends createZodDto(UpdateVisibilityReqSchema) {}

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

/**
 * DTO cho rename file
 */
export const RenameFileReqSchema = z.object({
    newFileName: z.string().min(1).max(255),
})
export class RenameFileReqDto extends createZodDto(RenameFileReqSchema) {}

// ============================================
// Response DTOs
// ============================================

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
    sizeBytes: z.bigint().nullable(),
    visibility: z.string(),
    uploadedBy: z.number().nullable(),
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    url: z.string().optional(), // URL để access file
    uploader: UploaderResSchema.optional(),
})
export class MediaResDto extends createZodDto(MediaResSchema) {}

/**
 * DTO cho upload response
 */
export const UploadResSchema = z.object({
    id: z.number(),
    disk: z.string(),
    bucket: z.string(),
    objectKey: z.string(),
    mimeType: z.string().nullable(),
    sizeBytes: z.bigint().nullable(),
    visibility: z.string(),
    url: z.string(),
    createdAt: z.date(),
})
export class UploadResDto extends createZodDto(UploadResSchema) {}

/**
 * DTO cho storage stats
 */
export const StorageStatsResSchema = z.object({
    totalFiles: z.number(),
    totalSize: z.bigint(),
    totalSizeFormatted: z.string(), // e.g., "10.5 MB"
})
export class StorageStatsResDto extends createZodDto(StorageStatsResSchema) {}

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
