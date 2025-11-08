import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * DTO cho rename file
 */
export const RenameFileReqSchema = z.object({
    newFileName: z.string().min(1).max(255),
})
export class RenameFileReqDto extends createZodDto(RenameFileReqSchema) {}
