import { OtpCodeType, OtpRecord, RefreshToken, User } from '@prisma/client'

export interface IAuthRepo {
    createUser(data: { email: string; passwordHash: string; phoneNumber: string; fullName: string }): Promise<User>

    createOtpCode(data: { email: string; otpCode: string; codeType: OtpCodeType; expiresAt: Date }): Promise<void>

    findOtpCode(data: { email: string; otpCode: string; codeType: OtpCodeType }): Promise<OtpRecord | null>

    deleteOtpCode(data: { email: string }): Promise<void>

    createRefreshToken(data: { token: string; userId: number; expiresAt: Date }): Promise<void>

    findRefreshToken(data: { token: string }): Promise<RefreshToken | null>

    deleteRefreshToken(data: { token: string }): Promise<void>
}
