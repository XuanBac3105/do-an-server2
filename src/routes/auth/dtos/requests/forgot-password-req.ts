import { createZodDto } from 'nestjs-zod'
import { SendOtpReqSchema } from './send-otp-req.dto'
import z from 'zod'

export const ForgotPasswordReqSchema = SendOtpReqSchema

export class ForgotPasswordReqDto extends createZodDto(ForgotPasswordReqSchema) {}

export type ForgotPasswordReqType = z.infer<typeof ForgotPasswordReqSchema>
