import { Test, TestingModule } from '@nestjs/testing'
import { AuthRepo } from '../repos/auth.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import { OtpCodeType, Role } from '@prisma/client'

describe('AuthRepo', () => {
    let repo: AuthRepo
    let prismaService: PrismaService

    const mockPrismaService = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        otpRecord: {
            create: jest.fn(),
            findFirst: jest.fn(),
            deleteMany: jest.fn(),
        },
        refreshToken: {
            create: jest.fn(),
            findFirst: jest.fn(),
            deleteMany: jest.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthRepo,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile()

        repo = module.get<AuthRepo>(AuthRepo)
        prismaService = module.get<PrismaService>(PrismaService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(repo).toBeDefined()
    })

    describe('createUser', () => {
        const userData = {
            fullName: 'Test User',
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            phoneNumber: '0123456789',
        }

        const expectedUser = {
            id: 1,
            ...userData,
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should create a user successfully', async () => {
            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: userData,
            })
            expect(result).toEqual(expectedUser)
        })

        it('should propagate database errors', async () => {
            const dbError = new Error('Database connection failed')
            mockPrismaService.user.create.mockRejectedValue(dbError)

            await expect(repo.createUser(userData)).rejects.toThrow(dbError)
        })

        it('should handle duplicate email error', async () => {
            const duplicateError = new Error('Unique constraint failed on email')
            mockPrismaService.user.create.mockRejectedValue(duplicateError)

            await expect(repo.createUser(userData)).rejects.toThrow(duplicateError)
        })
    })

    describe('createOtpCode', () => {
        const otpData = {
            email: 'test@example.com',
            otpCode: '123456',
            codeType: OtpCodeType.email_verification,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        }

        it('should create OTP code successfully', async () => {
            mockPrismaService.otpRecord.create.mockResolvedValue(undefined)

            await repo.createOtpCode(otpData)

            expect(prismaService.otpRecord.create).toHaveBeenCalledWith({
                data: otpData,
            })
        })

        it('should handle different OTP code types', async () => {
            const passwordResetOtpData = {
                ...otpData,
                codeType: OtpCodeType.password_reset,
            }

            mockPrismaService.otpRecord.create.mockResolvedValue(undefined)

            await repo.createOtpCode(passwordResetOtpData)

            expect(prismaService.otpRecord.create).toHaveBeenCalledWith({
                data: passwordResetOtpData,
            })
        })

        it('should propagate database errors', async () => {
            const dbError = new Error('Database error')
            mockPrismaService.otpRecord.create.mockRejectedValue(dbError)

            await expect(repo.createOtpCode(otpData)).rejects.toThrow(dbError)
        })
    })

    describe('findOtpCode', () => {
        const findOtpData = {
            email: 'test@example.com',
            otpCode: '123456',
            codeType: OtpCodeType.email_verification,
        }

        const validOtpRecord = {
            id: BigInt(1),
            email: 'test@example.com',
            otpCode: '123456',
            codeType: OtpCodeType.email_verification,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        }

        it('should find valid OTP code', async () => {
            mockPrismaService.otpRecord.findFirst.mockResolvedValue(validOtpRecord)

            const result = await repo.findOtpCode(findOtpData)

            expect(prismaService.otpRecord.findFirst).toHaveBeenCalledWith({
                where: {
                    email: findOtpData.email,
                    otpCode: findOtpData.otpCode,
                    codeType: findOtpData.codeType,
                    expiresAt: {
                        gt: expect.any(Date),
                    },
                },
            })
            expect(result).toEqual(validOtpRecord)
        })

        it('should return null when OTP code not found', async () => {
            mockPrismaService.otpRecord.findFirst.mockResolvedValue(null)

            const result = await repo.findOtpCode(findOtpData)

            expect(result).toBeNull()
        })

        it('should filter by expiration date', async () => {
            mockPrismaService.otpRecord.findFirst.mockResolvedValue(validOtpRecord)

            await repo.findOtpCode(findOtpData)

            const callArgs = mockPrismaService.otpRecord.findFirst.mock.calls[0][0]
            expect(callArgs.where.expiresAt).toBeDefined()
            expect(callArgs.where.expiresAt.gt).toBeInstanceOf(Date)
        })

        it('should propagate database errors', async () => {
            const dbError = new Error('Database error')
            mockPrismaService.otpRecord.findFirst.mockRejectedValue(dbError)

            await expect(repo.findOtpCode(findOtpData)).rejects.toThrow(dbError)
        })
    })

    describe('deleteOtpCode', () => {
        const deleteData = {
            email: 'test@example.com',
        }

        it('should delete OTP code successfully', async () => {
            mockPrismaService.otpRecord.deleteMany.mockResolvedValue({ count: 1 })

            await repo.deleteOtpCode(deleteData)

            expect(prismaService.otpRecord.deleteMany).toHaveBeenCalledWith({
                where: deleteData,
            })
        })

        it('should handle no records deleted', async () => {
            mockPrismaService.otpRecord.deleteMany.mockResolvedValue({ count: 0 })

            await repo.deleteOtpCode(deleteData)

            expect(prismaService.otpRecord.deleteMany).toHaveBeenCalledWith({
                where: deleteData,
            })
        })

        it('should propagate database errors', async () => {
            const dbError = new Error('Database error')
            mockPrismaService.otpRecord.deleteMany.mockRejectedValue(dbError)

            await expect(repo.deleteOtpCode(deleteData)).rejects.toThrow(dbError)
        })
    })

    describe('createRefreshToken', () => {
        const refreshTokenData = {
            token: 'refresh_token_string',
            userId: 1,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }

        it('should create refresh token successfully', async () => {
            mockPrismaService.refreshToken.create.mockResolvedValue(undefined)

            await repo.createRefreshToken(refreshTokenData)

            expect(prismaService.refreshToken.create).toHaveBeenCalledWith({
                data: refreshTokenData,
            })
        })

        it('should propagate database errors', async () => {
            const dbError = new Error('Database error')
            mockPrismaService.refreshToken.create.mockRejectedValue(dbError)

            await expect(repo.createRefreshToken(refreshTokenData)).rejects.toThrow(dbError)
        })
    })

    describe('findRefreshToken', () => {
        const findTokenData = {
            token: 'refresh_token_string',
        }

        const validRefreshToken = {
            id: BigInt(1),
            token: 'refresh_token_string',
            userId: 1,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }

        it('should find valid refresh token', async () => {
            mockPrismaService.refreshToken.findFirst.mockResolvedValue(validRefreshToken)

            const result = await repo.findRefreshToken(findTokenData)

            expect(prismaService.refreshToken.findFirst).toHaveBeenCalledWith({
                where: {
                    token: findTokenData.token,
                    expiresAt: {
                        gt: expect.any(Date),
                    },
                },
            })
            expect(result).toEqual(validRefreshToken)
        })

        it('should return null when refresh token not found', async () => {
            mockPrismaService.refreshToken.findFirst.mockResolvedValue(null)

            const result = await repo.findRefreshToken(findTokenData)

            expect(result).toBeNull()
        })

        it('should filter by expiration date', async () => {
            mockPrismaService.refreshToken.findFirst.mockResolvedValue(validRefreshToken)

            await repo.findRefreshToken(findTokenData)

            const callArgs = mockPrismaService.refreshToken.findFirst.mock.calls[0][0]
            expect(callArgs.where.expiresAt).toBeDefined()
            expect(callArgs.where.expiresAt.gt).toBeInstanceOf(Date)
        })

        it('should propagate database errors', async () => {
            const dbError = new Error('Database error')
            mockPrismaService.refreshToken.findFirst.mockRejectedValue(dbError)

            await expect(repo.findRefreshToken(findTokenData)).rejects.toThrow(dbError)
        })
    })

    describe('deleteRefreshToken', () => {
        const deleteData = {
            token: 'refresh_token_string',
        }

        it('should delete refresh token successfully', async () => {
            mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 1 })

            await repo.deleteRefreshToken(deleteData)

            expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: deleteData,
            })
        })

        it('should handle no records deleted', async () => {
            mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 0 })

            await repo.deleteRefreshToken(deleteData)

            expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: deleteData,
            })
        })

        it('should propagate database errors', async () => {
            const dbError = new Error('Database error')
            mockPrismaService.refreshToken.deleteMany.mockRejectedValue(dbError)

            await expect(repo.deleteRefreshToken(deleteData)).rejects.toThrow(dbError)
        })
    })
})
