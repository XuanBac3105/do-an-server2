import { createZodDto } from 'nestjs-zod'
import { RefreshTokenReqSchema } from './refresh-token-req.dto'
import z from 'zod'

export const LogoutReqSchema = RefreshTokenReqSchema
export class LogoutReqDto extends createZodDto(LogoutReqSchema) {}
export type LogoutReqType = z.infer<typeof LogoutReqSchema>
