import { HttpException, Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common'
import { AuthRepo } from './auth.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo'
import { OtpCodeType, User } from '@prisma/client';
import { EmailService } from 'src/shared/services/email.service';
import { RegisterReqDto, SendOtpReqDto } from './auth.dto';
import { ResponseMessage } from 'src/shared/types/response-message.type';

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepo: AuthRepo,
        private readonly hashingService: HashingService,
        private readonly sharedUserRepo: SharedUserRepo,
        private readonly emailService: EmailService,
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
}
