import {
    HttpException,
    Inject,
    Injectable,
    InternalServerErrorException,
    UnprocessableEntityException,
} from '@nestjs/common'
import { OtpCodeType, User } from '@prisma/client'
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { EmailService } from 'src/shared/services/email.service'
import { TokenService } from 'src/shared/services/token.service'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { LoginReqType } from '../dtos/requests/login-req.dto'
import { LoginResType } from '../dtos/responses/login-res.dto'
import { RefreshTokenReqType } from '../dtos/requests/refresh-token-req.dto'
import { RefreshTokenResType } from '../dtos/responses/refresh-token-req.dto'
import { LogoutReqType } from '../dtos/requests/logout-req.dto'
import { ForgotPasswordReqType } from '../dtos/requests/forgot-password-req'
import { ResetPasswordReqType } from '../dtos/requests/reset-password.dto'
import { SendOtpReqType } from '../dtos/requests/send-otp-req.dto'
import { RegisterReqType } from '../dtos/requests/register-req.dto'
import type { IAuthRepo } from '../repos/auth.interface.repo'
import { IAuthService } from './auth.interface.service'

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject('IAuthRepo') private readonly authRepo: IAuthRepo,
        private readonly sharedUserRepo: SharedUserRepo,
        private readonly hashingService: HashingService,
        private readonly emailService: EmailService,
        private readonly tokenService: TokenService,
    ) {}

    async sendOtp(data: { email: string; otpCodeType: OtpCodeType }): Promise<void> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        await this.authRepo.createOtpCode({
            email: data.email,
            otpCode: otp,
            codeType: data.otpCodeType,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        })
        await this.emailService.sendEmail({
            email: data.email,
            subject: 'Mã xác thực',
            content: `Mã OTP của bạn là: ${otp}`,
        })
    }

    async sendOtpRegister(data: SendOtpReqType): Promise<ResponseMessage> {
        try {
            await this.sendOtp({
                email: data.email,
                otpCodeType: OtpCodeType.email_verification,
            })
            return { message: 'Mã OTP đã được gửi đến email của bạn.' }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException('Đã xảy ra lỗi khi gửi mã OTP')
        }
    }

    async register(data: RegisterReqType): Promise<User> {
        const user = await this.sharedUserRepo.findUnique({
            email: data.email,
        })
        if (user) {
            throw new UnprocessableEntityException('Email đã tồn tại')
        }
        const otpCode = await this.authRepo.findOtpCode({
            email: data.email,
            otpCode: data.otpCode,
            codeType: OtpCodeType.email_verification,
        })
        if (!otpCode) {
            throw new UnprocessableEntityException('Mã OTP không hợp lệ hoặc đã hết hạn')
        }
        await this.authRepo.deleteOtpCode({
            email: data.email,
        })
        const phoneNumber = await this.sharedUserRepo.findUnique({
            phoneNumber: data.phoneNumber,
        })
        if (phoneNumber) {
            throw new UnprocessableEntityException('Số điện thoại đã tồn tại')
        }
        const passwordHash = await this.hashingService.hash(data.password)
        return await this.authRepo.createUser({
            email: data.email,
            passwordHash: passwordHash,
            phoneNumber: data.phoneNumber,
            fullName: data.fullName,
        })
    }

    async login(data: LoginReqType): Promise<RefreshTokenResType> {
        const user = await this.sharedUserRepo.findUnique({
            email: data.email,
        })
        if (!user) {
            throw new UnprocessableEntityException('Email hoặc mật khẩu không đúng')
        }
        const isPasswordValid = await this.hashingService.compare(data.password, user.passwordHash)
        if (!isPasswordValid) {
            throw new UnprocessableEntityException('Email hoặc mật khẩu không đúng')
        }
        if (!user.isActive) {
            throw new UnprocessableEntityException('Tài khoản đã bị vô hiệu hóa')
        }
        return await this.generateTokens({ userId: user.id })
    }

    async generateTokens(data: { userId: number }): Promise<LoginResType> {
        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.signAccessToken({
                userId: data.userId,
            }),
            this.tokenService.signRefreshToken({
                userId: data.userId,
            }),
        ])
        const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
        await this.authRepo.createRefreshToken({
            token: refreshToken,
            userId: data.userId,
            expiresAt: new Date(decodedRefreshToken.exp * 1000),
        })
        return { accessToken, refreshToken }
    }

    async refreshToken(data: RefreshTokenReqType): Promise<RefreshTokenResType> {
        const refreshToken = await this.authRepo.findRefreshToken({
            token: data.refreshToken,
        })
        if (!refreshToken) {
            throw new UnprocessableEntityException('Refresh token không hợp lệ')
        }
        const decodedRefreshToken = await this.tokenService.verifyRefreshToken(data.refreshToken)
        if (!decodedRefreshToken) {
            throw new UnprocessableEntityException('Refresh token không hợp lệ')
        }
        const user = await this.sharedUserRepo.findUnique({
            id: decodedRefreshToken.userId,
        })
        if (!user) {
            throw new UnprocessableEntityException('Người dùng không tồn tại')
        }
        await this.authRepo.deleteRefreshToken({
            token: data.refreshToken,
        })
        return await this.generateTokens({ userId: user.id })
    }

    async logout(data: LogoutReqType): Promise<ResponseMessage> {
        await this.authRepo.deleteRefreshToken({
            token: data.refreshToken,
        })
        return { message: 'Đăng xuất thành công.' }
    }

    async forgotPassword(data: ForgotPasswordReqType): Promise<ResponseMessage> {
        try {
            const user = await this.sharedUserRepo.findUnique({
                email: data.email,
            })
            if (!user) {
                throw new UnprocessableEntityException('Người dùng không tồn tại')
            }
            await this.sendOtp({
                email: data.email,
                otpCodeType: OtpCodeType.password_reset,
            })
            return { message: 'Đã gửi mã xác thực quên mật khẩu.' }
        } catch (error) {
            throw new InternalServerErrorException('Đã xảy ra lỗi khi gửi mã OTP. Vui lòng thử lại sau.')
        }
    }

    async resetPassword(data: ResetPasswordReqType): Promise<ResponseMessage> {
        const otpCode = await this.authRepo.findOtpCode({
            email: data.email,
            otpCode: data.otpCode,
            codeType: OtpCodeType.password_reset,
        })
        if (!otpCode) {
            throw new UnprocessableEntityException('Mã OTP không hợp lệ hoặc đã hết hạn')
        }
        await this.authRepo.deleteOtpCode({
            email: data.email,
        })
        const user = await this.sharedUserRepo.findUnique({
            email: data.email,
        })
        if (!user) {
            throw new UnprocessableEntityException('Người dùng không tồn tại')
        }
        const passwordHash = await this.hashingService.hash(data.newPassword)
        await this.sharedUserRepo.updateUser({
            id: user.id,
            passwordHash: passwordHash,
        })
        await this.authRepo.deleteRefreshToken({
            token: data.email,
        })
        return { message: 'Đặt lại mật khẩu thành công.' }
    }
}
