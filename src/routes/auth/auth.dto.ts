import { createZodDto } from 'nestjs-zod'
import {
    ForgotPasswordReqSchema,
    RegisterReqSchema,
    RegisterResSchema,
    ResetPasswordReqSchema,
    SendOtpReqSchema,
} from './auth.model'

export class RegisterReqDto extends createZodDto(RegisterReqSchema) {}
export class RegisterResDto extends createZodDto(RegisterResSchema) {}

export class SendOtpReqDto extends createZodDto(SendOtpReqSchema) {}

export class ForgotPasswordReqDto extends createZodDto(ForgotPasswordReqSchema) {}
export class ResetPasswordReqDto extends createZodDto(ResetPasswordReqSchema) {}
