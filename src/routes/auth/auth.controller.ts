import { Body, Controller, Delete, Post, Put } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ForgotPasswordReqDto, LoginReqDto, LoginResDto, LogoutReqDto, RefreshTokenReqDto, RefreshTokenResDto, RegisterReqDto, RegisterResDto, ResetPasswordReqDto, SendOtpReqDto } from './auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { Throttle } from '@nestjs/throttler'
import { IsPublic } from 'src/shared/decorators/is-public.decorator'

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @IsPublic()
    @Post('send-otp')
    async sendOtp(@Body() body: SendOtpReqDto): Promise<ResponseMessage> {
        return await this.authService.sendOtpRegister(body)
    }

    @Throttle({ default: { limit: 3, ttl: 600000 } })
    @IsPublic()
    @Post('register')
    @ZodSerializerDto(RegisterResDto)
    async register(@Body() body: RegisterReqDto): Promise<RegisterResDto> {
        return await this.authService.register(body)
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
}
