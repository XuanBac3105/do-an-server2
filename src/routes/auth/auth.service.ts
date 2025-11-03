import { HttpException, Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common'
import { AuthRepo } from './auth.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo'
import { EmailService } from 'src/shared/services/email.service';
import { OtpCodeType, User } from '@prisma/client';
import { ForgotPasswordReqDto, LoginReqDto, LoginResDto, RefreshTokenReqDto, RefreshTokenResDto, RegisterReqDto, ResetPasswordReqDto, SendOtpReqDto } from './auth.dto';
import { ResponseMessage } from 'src/shared/types/response-message.type';
import { TokenService } from 'src/shared/services/token.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepo: AuthRepo,
        private readonly hashingService: HashingService,
        private readonly sharedUserRepo: SharedUserRepo,
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

    async sendOtpRegister(data: SendOtpReqDto): Promise<ResponseMessage> {
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

    async register(data: RegisterReqDto): Promise<User> {
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
    async forgotPassword(data: ForgotPasswordReqDto): Promise<ResponseMessage> {
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

    async resetPassword(data: ResetPasswordReqDto): Promise<ResponseMessage> {
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

    async login(data: LoginReqDto): Promise<LoginResDto> {
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

    async generateTokens(data: { userId: number }): Promise<LoginResDto> {
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

    async refreshToken(data: RefreshTokenReqDto): Promise<RefreshTokenResDto> {
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
}
