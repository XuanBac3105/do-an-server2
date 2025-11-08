import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * DTO cho storage stats
 */
export const StorageStatsResSchema = z.object({
    totalFiles: z.number(),
    totalSize: z.union([z.bigint(), z.number(), z.string()]).transform((val) => {
        if (typeof val === 'bigint') return val.toString()
        return val
    }),
    totalSizeFormatted: z.string(), // e.g., "10.5 MB"
})
export class StorageStatsResDto extends createZodDto(StorageStatsResSchema) {}
