import { Test, TestingModule } from '@nestjs/testing'
import { AuthRepo } from './auth.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import { OtpCodeType } from '@prisma/client'

describe('AuthRepo', () => {
    let repo: AuthRepo
    let prismaService: PrismaService

    const mockPrismaService = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        otpRecord: {
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
        it('should create a user with all required fields', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                phoneNumber: '0123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                role: 'student',
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: userData,
            })
            expect(result).toEqual(expectedUser)
        })

        it('should handle database errors when creating user', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                phoneNumber: '0123456789',
            }

            const dbError = new Error('Database connection failed')
            mockPrismaService.user.create.mockRejectedValue(dbError)

            await expect(repo.createUser(userData)).rejects.toThrow('Database connection failed')
        })

        it('should handle duplicate email error', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'duplicate@example.com',
                passwordHash: 'hashed_password',
                phoneNumber: '0123456789',
            }

            const duplicateError = new Error('Unique constraint failed')
            mockPrismaService.user.create.mockRejectedValue(duplicateError)

            await expect(repo.createUser(userData)).rejects.toThrow('Unique constraint failed')
        })

        it('should preserve exact email format', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'Test.User+tag@Example.COM',
                passwordHash: 'hashed_password',
                phoneNumber: '0123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                role: 'student',
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.email).toBe('Test.User+tag@Example.COM')
        })

        it('should create user with very long password hash', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'a'.repeat(200),
                phoneNumber: '0123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                role: 'student',
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.passwordHash).toHaveLength(200)
        })

        it('should create user with international phone number', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                phoneNumber: '+84123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                role: 'student',
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.phoneNumber).toBe('+84123456789')
        })

        it('should create user with special characters in name', async () => {
            const userData = {
                fullName: "O'Connor-Smith Nguyễn Văn A",
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                phoneNumber: '0123456789',
            }

            const expectedUser = {
                id: 1,
                ...userData,
                role: 'student',
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.fullName).toBe("O'Connor-Smith Nguyễn Văn A")
        })

        it('should return user with correct timestamps', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                phoneNumber: '0123456789',
            }

            const now = new Date()
            const expectedUser = {
                id: 1,
                ...userData,
                role: 'student',
                isActive: true,
                avatarMediaId: null,
                createdAt: now,
                updatedAt: now,
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.createdAt).toEqual(now)
            expect(result.updatedAt).toEqual(now)
        })

        it('should return user with auto-incremented id', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                phoneNumber: '0123456789',
            }

            const expectedUser = {
                id: 999,
                ...userData,
                role: 'student',
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrismaService.user.create.mockResolvedValue(expectedUser)

            const result = await repo.createUser(userData)

            expect(result.id).toBe(999)
            expect(typeof result.id).toBe('number')
        })

        it('should call prisma.user.create exactly once', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                phoneNumber: '0123456789',
            }

            mockPrismaService.user.create.mockResolvedValue({
                id: 1,
                ...userData,
                role: 'student',
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })

            await repo.createUser(userData)

            expect(prismaService.user.create).toHaveBeenCalledTimes(1)
        })
    })

    describe('createOtpCode', () => {
        it('should create OTP code successfully', async () => {
            const otpData = {
                email: 'test@example.com',
                otpCode: '123456',
                codeType: OtpCodeType.email_verification,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            }

            mockPrismaService.otpRecord.create.mockResolvedValue({
                id: BigInt(1),
                ...otpData,
                createdAt: new Date(),
            })

            await repo.createOtpCode(otpData)

            expect(prismaService.otpRecord.create).toHaveBeenCalledWith({
                data: otpData,
            })
            expect(prismaService.otpRecord.create).toHaveBeenCalledTimes(1)
        })

        it('should handle database errors', async () => {
            const otpData = {
                email: 'test@example.com',
                otpCode: '123456',
                codeType: OtpCodeType.email_verification,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            }

            const dbError = new Error('Database error')
            mockPrismaService.otpRecord.create.mockRejectedValue(dbError)

            await expect(repo.createOtpCode(otpData)).rejects.toThrow('Database error')
        })

        it('should create OTP with password reset type', async () => {
            const otpData = {
                email: 'test@example.com',
                otpCode: '654321',
                codeType: OtpCodeType.password_reset,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            }

            mockPrismaService.otpRecord.create.mockResolvedValue({
                id: BigInt(1),
                ...otpData,
                createdAt: new Date(),
            })

            await repo.createOtpCode(otpData)

            expect(prismaService.otpRecord.create).toHaveBeenCalledWith({
                data: otpData,
            })
        })
    })

    describe('findOtpCode', () => {
        it('should find valid OTP code', async () => {
            const searchParams = {
                email: 'test@example.com',
                otpCode: '123456',
                codeType: OtpCodeType.email_verification,
            }

            const expectedOtp = {
                id: BigInt(1),
                ...searchParams,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            }

            mockPrismaService.otpRecord.findFirst.mockResolvedValue(expectedOtp)

            const result = await repo.findOtpCode(searchParams)

            expect(prismaService.otpRecord.findFirst).toHaveBeenCalledWith({
                where: {
                    email: searchParams.email,
                    otpCode: searchParams.otpCode,
                    codeType: searchParams.codeType,
                    expiresAt: {
                        gt: expect.any(Date),
                    },
                },
            })
            expect(result).toEqual(expectedOtp)
        })

        it('should return null if OTP not found', async () => {
            const searchParams = {
                email: 'test@example.com',
                otpCode: '999999',
                codeType: OtpCodeType.email_verification,
            }

            mockPrismaService.otpRecord.findFirst.mockResolvedValue(null)

            const result = await repo.findOtpCode(searchParams)

            expect(result).toBeNull()
        })

        it('should filter by expiration date', async () => {
            const searchParams = {
                email: 'test@example.com',
                otpCode: '123456',
                codeType: OtpCodeType.email_verification,
            }

            mockPrismaService.otpRecord.findFirst.mockResolvedValue(null)

            await repo.findOtpCode(searchParams)

            const callArgs = mockPrismaService.otpRecord.findFirst.mock.calls[0][0]
            expect(callArgs.where.expiresAt).toHaveProperty('gt')
            expect(callArgs.where.expiresAt.gt).toBeInstanceOf(Date)
        })

        it('should handle database errors', async () => {
            const searchParams = {
                email: 'test@example.com',
                otpCode: '123456',
                codeType: OtpCodeType.email_verification,
            }

            const dbError = new Error('Database error')
            mockPrismaService.otpRecord.findFirst.mockRejectedValue(dbError)

            await expect(repo.findOtpCode(searchParams)).rejects.toThrow('Database error')
        })
    })

    describe('deleteOtpCode', () => {
        it('should delete OTP codes for email', async () => {
            const deleteParams = {
                email: 'test@example.com',
            }

            mockPrismaService.otpRecord.deleteMany.mockResolvedValue({ count: 2 })

            await repo.deleteOtpCode(deleteParams)

            expect(prismaService.otpRecord.deleteMany).toHaveBeenCalledWith({
                where: deleteParams,
            })
            expect(prismaService.otpRecord.deleteMany).toHaveBeenCalledTimes(1)
        })

        it('should handle case when no OTP codes exist', async () => {
            const deleteParams = {
                email: 'test@example.com',
            }

            mockPrismaService.otpRecord.deleteMany.mockResolvedValue({ count: 0 })

            await repo.deleteOtpCode(deleteParams)

            expect(prismaService.otpRecord.deleteMany).toHaveBeenCalledWith({
                where: deleteParams,
            })
        })

        it('should handle database errors', async () => {
            const deleteParams = {
                email: 'test@example.com',
            }

            const dbError = new Error('Database error')
            mockPrismaService.otpRecord.deleteMany.mockRejectedValue(dbError)

            await expect(repo.deleteOtpCode(deleteParams)).rejects.toThrow('Database error')
        })
    })
})
