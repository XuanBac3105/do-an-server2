import { OtpCodeType, OtpRecord, RefreshToken, User } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { IAuthRepo } from './auth.interface.repo'

@Injectable()
export class AuthRepo implements IAuthRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async createUser(data: {
        email: string
        passwordHash: string
        phoneNumber: string
        fullName: string
    }): Promise<User> {
        return await this.prismaService.user.create({
            data,
        })
    }

    async createOtpCode(data: {
        email: string
        otpCode: string
        codeType: OtpCodeType
        expiresAt: Date
    }): Promise<void> {
        await this.prismaService.otpRecord.create({
            data,
        })
    }

    async findOtpCode(data: { email: string; otpCode: string; codeType: OtpCodeType }): Promise<OtpRecord | null> {
        return await this.prismaService.otpRecord.findFirst({
            where: {
                email: data.email,
                otpCode: data.otpCode,
                codeType: data.codeType,
                expiresAt: {
                    gt: new Date(),
                },
            },
        })
    }

    async deleteOtpCode(data: { email: string }): Promise<void> {
        await this.prismaService.otpRecord.deleteMany({
            where: data,
        })
    }

    async createRefreshToken(data: { token: string; userId: number; expiresAt: Date }): Promise<void> {
        await this.prismaService.refreshToken.create({
            data,
        })
    }

    async findRefreshToken(data: { token: string }): Promise<RefreshToken | null> {
        return await this.prismaService.refreshToken.findFirst({
            where: {
                token: data.token,
                expiresAt: {
                    gt: new Date(),
                },
            },
        })
    }

    async deleteRefreshToken(data: { token: string }): Promise<void> {
        await this.prismaService.refreshToken.deleteMany({
            where: data,
        })
    }
}
