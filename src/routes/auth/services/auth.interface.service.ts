import { OtpCodeType, User } from '@prisma/client'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { SendOtpReqType } from '../dtos/requests/send-otp-req.dto'
import { RegisterReqType } from '../dtos/requests/register-req.dto'
import { LoginReqType } from '../dtos/requests/login-req.dto'
import { RefreshTokenResType } from '../dtos/responses/refresh-token-req.dto'
import { LoginResType } from '../dtos/responses/login-res.dto'
import { RefreshTokenReqType } from '../dtos/requests/refresh-token-req.dto'
import { LogoutReqType } from '../dtos/requests/logout-req.dto'
import { ForgotPasswordReqType } from '../dtos/requests/forgot-password-req'
import { ResetPasswordReqType } from '../dtos/requests/reset-password.dto'

export interface IAuthService {
    sendOtp(data: { email: string; otpCodeType: OtpCodeType }): Promise<void>

    sendOtpRegister(data: SendOtpReqType): Promise<ResponseMessage>

    register(data: RegisterReqType): Promise<User>

    login(data: LoginReqType): Promise<RefreshTokenResType>

    generateTokens(data: { userId: number }): Promise<LoginResType>

    refreshToken(data: RefreshTokenReqType): Promise<RefreshTokenResType>

    logout(data: LogoutReqType): Promise<ResponseMessage>

    forgotPassword(data: ForgotPasswordReqType): Promise<ResponseMessage>

    resetPassword(data: ResetPasswordReqType): Promise<ResponseMessage>
}
