import { createZodDto } from 'nestjs-zod'
import {
    ForgotPasswordReqSchema,
    LoginReqSchema,
    LoginResSchema,
    RefreshTokenReqSchema,
    RefreshTokenResSchema,
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

export class LoginReqDto extends createZodDto(LoginReqSchema) {}
export class LoginResDto extends createZodDto(LoginResSchema) {}

export class RefreshTokenReqDto extends createZodDto(RefreshTokenReqSchema) {}
export class RefreshTokenResDto extends createZodDto(RefreshTokenResSchema) {}