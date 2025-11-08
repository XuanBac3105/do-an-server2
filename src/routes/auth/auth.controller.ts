import { Body, Controller, Delete, Inject, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { Throttle } from '@nestjs/throttler'
import { IsPublic } from 'src/shared/decorators/is-public.decorator'
import { RegisterReqDto } from './dtos/requests/register-req.dto'
import { SendOtpReqDto } from './dtos/requests/send-otp-req.dto'
import { LoginReqDto } from './dtos/requests/login-req.dto'
import { LoginResDto } from './dtos/responses/login-res.dto'
import { RefreshTokenReqDto } from './dtos/requests/refresh-token-req.dto'
import { RefreshTokenResDto } from './dtos/responses/refresh-token-req.dto'
import { LogoutReqDto } from './dtos/requests/logout-req.dto'
import { ForgotPasswordReqDto } from './dtos/requests/forgot-password-req'
import { ResetPasswordReqDto } from './dtos/requests/reset-password.dto'
import type { IAuthService } from './services/auth.interface.service'
import { UserResDto } from 'src/shared/dtos/user-res.dto'

@Controller('auth')
export class AuthController {
    constructor(@Inject('IAuthService') private readonly authService: IAuthService) {}

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @IsPublic()
    @Post('send-otp')
    async sendOtp(@Body() body: SendOtpReqDto): Promise<ResponseMessage> {
        return await this.authService.sendOtpRegister(body)
    }

    @Throttle({ default: { limit: 3, ttl: 600000 } })
    @IsPublic()
    @Post('register')
    @ZodSerializerDto(UserResDto)
    async register(@Body() body: RegisterReqDto): Promise<UserResDto> {
        return await this.authService.register(body)
    }

    @Throttle({ default: { limit: 5, ttl: 300000 } })
    @IsPublic()
    @Post('login')
    @ZodSerializerDto(LoginResDto)
    async login(@Body() body: LoginReqDto): Promise<LoginResDto> {
        return await this.authService.login(body)
    }

    @Post('refresh-token')
    @ZodSerializerDto(RefreshTokenResDto)
    async refreshToken(@Body() body: RefreshTokenReqDto): Promise<RefreshTokenResDto> {
        return await this.authService.refreshToken(body)
    }

    @Delete('logout')
    async logout(@Body() body: LogoutReqDto): Promise<ResponseMessage> {
        return await this.authService.logout(body)
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @IsPublic()
    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordReqDto): Promise<ResponseMessage> {
        return await this.authService.forgotPassword(body)
    }

    @IsPublic()
    @Put('reset-password')
    async resetPassword(@Body() body: ResetPasswordReqDto): Promise<ResponseMessage> {
        return await this.authService.resetPassword(body)
    }
}
