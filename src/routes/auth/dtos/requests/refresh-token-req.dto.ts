import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const RefreshTokenReqSchema = z.object({
    refreshToken: z.string({ message: 'Refresh token là bắt buộc' }),
})

export class RefreshTokenReqDto extends createZodDto(RefreshTokenReqSchema) {}

export type RefreshTokenReqType = z.infer<typeof RefreshTokenReqSchema>
