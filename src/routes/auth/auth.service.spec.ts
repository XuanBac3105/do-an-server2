import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { AuthRepo } from './auth.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo'
import { EmailService } from 'src/shared/services/email.service'
import { InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common'
import { RegisterReqDto, SendOtpReqDto } from './auth.dto'
import { OtpCodeType, Role } from '@prisma/client'

describe('AuthService', () => {
    let service: AuthService
    let authRepo: AuthRepo
    let hashingService: HashingService
    let sharedUserRepo: SharedUserRepo
    let emailService: EmailService

    const mockAuthRepo = {
        createUser: jest.fn(),
        createOtpCode: jest.fn(),
        findOtpCode: jest.fn(),
        deleteOtpCode: jest.fn(),
    }

    const mockHashingService = {
        hash: jest.fn(),
        compare: jest.fn(),
    }

    const mockSharedUserRepo = {
        findUnique: jest.fn(),
        createUser: jest.fn(),
        update: jest.fn(),
    }

    const mockEmailService = {
        sendEmail: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: AuthRepo,
                    useValue: mockAuthRepo,
                },
                {
                    provide: HashingService,
                    useValue: mockHashingService,
                },
                {
                    provide: SharedUserRepo,
                    useValue: mockSharedUserRepo,
                },
                {
                    provide: EmailService,
                    useValue: mockEmailService,
                },
            ],
        }).compile()

        service = module.get<AuthService>(AuthService)
        authRepo = module.get<AuthRepo>(AuthRepo)
        hashingService = module.get<HashingService>(HashingService)
        sharedUserRepo = module.get<SharedUserRepo>(SharedUserRepo)
        emailService = module.get<EmailService>(EmailService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('sendOtp', () => {
        const email = 'test@example.com'
        const otpCodeType = OtpCodeType.email_verification

        it('should create OTP and send email successfully', async () => {
            mockAuthRepo.createOtpCode.mockResolvedValue(undefined)
            mockEmailService.sendEmail.mockResolvedValue(undefined)

            await service.sendOtp({ email, otpCodeType })

            expect(authRepo.createOtpCode).toHaveBeenCalledWith({
                email,
                otpCode: expect.any(String),
                codeType: otpCodeType,
                expiresAt: expect.any(Date),
            })
            expect(emailService.sendEmail).toHaveBeenCalledWith({
                email,
                subject: 'Mã xác thực',
                content: expect.stringContaining('Mã OTP của bạn là:'),
            })
        })

        it('should generate 6-digit OTP code', async () => {
            mockAuthRepo.createOtpCode.mockResolvedValue(undefined)
            mockEmailService.sendEmail.mockResolvedValue(undefined)

            await service.sendOtp({ email, otpCodeType })

            const createOtpCall = mockAuthRepo.createOtpCode.mock.calls[0][0]
            expect(createOtpCall.otpCode).toMatch(/^\d{6}$/)
        })

        it('should set expiration time to 5 minutes from now', async () => {
            mockAuthRepo.createOtpCode.mockResolvedValue(undefined)
            mockEmailService.sendEmail.mockResolvedValue(undefined)

            const beforeTime = Date.now() + 5 * 60 * 1000
            await service.sendOtp({ email, otpCodeType })
            const afterTime = Date.now() + 5 * 60 * 1000

            const createOtpCall = mockAuthRepo.createOtpCode.mock.calls[0][0]
            const expiresAt = createOtpCall.expiresAt.getTime()

            expect(expiresAt).toBeGreaterThanOrEqual(beforeTime - 1000)
            expect(expiresAt).toBeLessThanOrEqual(afterTime + 1000)
        })

        it('should send email with OTP in content', async () => {
            let capturedOtp = ''
            mockAuthRepo.createOtpCode.mockImplementation(async (data) => {
                capturedOtp = data.otpCode
            })
            mockEmailService.sendEmail.mockResolvedValue(undefined)

            await service.sendOtp({ email, otpCodeType })

            expect(emailService.sendEmail).toHaveBeenCalledWith({
                email,
                subject: 'Mã xác thực',
                content: `Mã OTP của bạn là: ${capturedOtp}`,
            })
        })

        it('should propagate errors from createOtpCode', async () => {
            const error = new Error('Database error')
            mockAuthRepo.createOtpCode.mockRejectedValue(error)

            await expect(service.sendOtp({ email, otpCodeType })).rejects.toThrow(error)
        })

        it('should propagate errors from sendEmail', async () => {
            const error = new Error('Email service error')
            mockAuthRepo.createOtpCode.mockResolvedValue(undefined)
            mockEmailService.sendEmail.mockRejectedValue(error)

            await expect(service.sendOtp({ email, otpCodeType })).rejects.toThrow(error)
        })
    })

    describe('sendOtpRegister', () => {
        const sendOtpDto: SendOtpReqDto = {
            email: 'test@example.com',
        }

        it('should send OTP for registration successfully', async () => {
            mockAuthRepo.createOtpCode.mockResolvedValue(undefined)
            mockEmailService.sendEmail.mockResolvedValue(undefined)

            const result = await service.sendOtpRegister(sendOtpDto)

            expect(authRepo.createOtpCode).toHaveBeenCalledWith({
                email: sendOtpDto.email,
                otpCode: expect.any(String),
                codeType: OtpCodeType.email_verification,
                expiresAt: expect.any(Date),
            })
            expect(result).toEqual({ message: 'Mã OTP đã được gửi đến email của bạn.' })
        })

        it('should return success message', async () => {
            mockAuthRepo.createOtpCode.mockResolvedValue(undefined)
            mockEmailService.sendEmail.mockResolvedValue(undefined)

            const result = await service.sendOtpRegister(sendOtpDto)

            expect(result).toHaveProperty('message')
            expect(result.message).toBe('Mã OTP đã được gửi đến email của bạn.')
        })

        it('should throw InternalServerErrorException on error', async () => {
            const error = new Error('Database error')
            mockAuthRepo.createOtpCode.mockRejectedValue(error)

            await expect(service.sendOtpRegister(sendOtpDto)).rejects.toThrow(
                InternalServerErrorException,
            )
            await expect(service.sendOtpRegister(sendOtpDto)).rejects.toThrow(
                'Đã xảy ra lỗi khi gửi mã OTP',
            )
        })

        it('should rethrow HttpException without wrapping', async () => {
            const httpError = new UnprocessableEntityException('Custom error')
            mockAuthRepo.createOtpCode.mockRejectedValue(httpError)

            await expect(service.sendOtpRegister(sendOtpDto)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.sendOtpRegister(sendOtpDto)).rejects.toThrow('Custom error')
        })

        it('should handle different email formats', async () => {
            const emails = [
                'test@example.com',
                'user.name+tag@example.co.uk',
                'test123@subdomain.example.com',
            ]

            for (const email of emails) {
                mockAuthRepo.createOtpCode.mockResolvedValue(undefined)
                mockEmailService.sendEmail.mockResolvedValue(undefined)

                await service.sendOtpRegister({ email })

                expect(authRepo.createOtpCode).toHaveBeenCalledWith(
                    expect.objectContaining({ email }),
                )
                jest.clearAllMocks()
            }
        })
    })

    describe('register', () => {
        const registerDto: RegisterReqDto = {
            fullName: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            phoneNumber: '0123456789',
            otpCode: '123456',
        }

        const validOtpRecord = {
            id: BigInt(1),
            email: 'test@example.com',
            otpCode: '123456',
            codeType: OtpCodeType.email_verification,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        }

        it('should register a new user successfully', async () => {
            const hashedPassword = 'hashed_password_123'
            const createdUser = {
                id: 1,
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: hashedPassword,
                phoneNumber: '0123456789',
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockSharedUserRepo.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
            mockHashingService.hash.mockResolvedValue(hashedPassword)
            mockAuthRepo.createUser.mockResolvedValue(createdUser)

            const result = await service.register(registerDto)

            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ email: registerDto.email })
            expect(authRepo.findOtpCode).toHaveBeenCalledWith({
                email: registerDto.email,
                otpCode: registerDto.otpCode,
                codeType: OtpCodeType.email_verification,
            })
            expect(authRepo.deleteOtpCode).toHaveBeenCalledWith({ email: registerDto.email })
            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({
                phoneNumber: registerDto.phoneNumber,
            })
            expect(hashingService.hash).toHaveBeenCalledWith(registerDto.password)
            expect(authRepo.createUser).toHaveBeenCalledWith({
                email: registerDto.email,
                passwordHash: hashedPassword,
                phoneNumber: registerDto.phoneNumber,
                fullName: registerDto.fullName,
            })
            expect(result).toEqual(createdUser)
        })

        it('should throw UnprocessableEntityException if email already exists', async () => {
            const existingUser = {
                id: 1,
                fullName: 'Existing User',
                email: 'test@example.com',
                passwordHash: 'hashed_password',
                phoneNumber: '0123456789',
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockSharedUserRepo.findUnique.mockResolvedValue(existingUser)

            await expect(service.register(registerDto)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.register(registerDto)).rejects.toThrow('Email đã tồn tại')

            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ email: registerDto.email })
            expect(authRepo.findOtpCode).not.toHaveBeenCalled()
            expect(hashingService.hash).not.toHaveBeenCalled()
            expect(authRepo.createUser).not.toHaveBeenCalled()
        })

        it('should throw UnprocessableEntityException if OTP is invalid', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(null)
            mockAuthRepo.findOtpCode.mockResolvedValue(null)

            await expect(service.register(registerDto)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.register(registerDto)).rejects.toThrow(
                'Mã OTP không hợp lệ hoặc đã hết hạn',
            )

            expect(authRepo.findOtpCode).toHaveBeenCalledWith({
                email: registerDto.email,
                otpCode: registerDto.otpCode,
                codeType: OtpCodeType.email_verification,
            })
            expect(authRepo.deleteOtpCode).not.toHaveBeenCalled()
            expect(hashingService.hash).not.toHaveBeenCalled()
        })

        it('should throw UnprocessableEntityException if phone number already exists', async () => {
            const existingUserWithPhone = {
                id: 2,
                fullName: 'Another User',
                email: 'another@example.com',
                passwordHash: 'hashed_password',
                phoneNumber: '0123456789',
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockSharedUserRepo.findUnique
                .mockResolvedValueOnce(null) // first call: check email
                .mockResolvedValueOnce(existingUserWithPhone) // second call: check phone
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)

            await expect(service.register(registerDto)).rejects.toThrow(
                UnprocessableEntityException,
            )
            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({
                phoneNumber: registerDto.phoneNumber,
            })
            expect(hashingService.hash).not.toHaveBeenCalled()
            expect(authRepo.createUser).not.toHaveBeenCalled()
        })

        it('should delete OTP after validation', async () => {
            const createdUser = {
                id: 1,
                fullName: registerDto.fullName,
                email: registerDto.email,
                passwordHash: 'hashed_password',
                phoneNumber: registerDto.phoneNumber,
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockSharedUserRepo.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
            mockHashingService.hash.mockResolvedValue('hashed_password')
            mockAuthRepo.createUser.mockResolvedValue(createdUser)

            await service.register(registerDto)

            expect(authRepo.deleteOtpCode).toHaveBeenCalledWith({ email: registerDto.email })
            expect(authRepo.deleteOtpCode).toHaveBeenCalledTimes(1)
        })

        it('should hash the password before creating user', async () => {
            const hashedPassword = 'super_secure_hashed_password'
            const createdUser = {
                id: 1,
                fullName: registerDto.fullName,
                email: registerDto.email,
                passwordHash: hashedPassword,
                phoneNumber: registerDto.phoneNumber,
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockSharedUserRepo.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
            mockHashingService.hash.mockResolvedValue(hashedPassword)
            mockAuthRepo.createUser.mockResolvedValue(createdUser)

            await service.register(registerDto)

            expect(hashingService.hash).toHaveBeenCalledWith(registerDto.password)
            expect(authRepo.createUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    passwordHash: hashedPassword,
                }),
            )
        })

        it('should call createUser with correct data structure', async () => {
            const hashedPassword = 'hashed_password_123'
            const createdUser = {
                id: 1,
                fullName: registerDto.fullName,
                email: registerDto.email,
                passwordHash: hashedPassword,
                phoneNumber: registerDto.phoneNumber,
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockSharedUserRepo.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
            mockHashingService.hash.mockResolvedValue(hashedPassword)
            mockAuthRepo.createUser.mockResolvedValue(createdUser)

            await service.register(registerDto)

            expect(authRepo.createUser).toHaveBeenCalledWith({
                email: registerDto.email,
                passwordHash: hashedPassword,
                phoneNumber: registerDto.phoneNumber,
                fullName: registerDto.fullName,
            })
        })

        it('should maintain execution order', async () => {
            const callOrder: string[] = []
            const createdUser = {
                id: 1,
                fullName: registerDto.fullName,
                email: registerDto.email,
                passwordHash: 'hashed_password',
                phoneNumber: registerDto.phoneNumber,
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockSharedUserRepo.findUnique.mockImplementation(async (query) => {
                if (query.email) {
                    callOrder.push('findUniqueEmail')
                } else if (query.phoneNumber) {
                    callOrder.push('findUniquePhone')
                }
                return null
            })
            mockAuthRepo.findOtpCode.mockImplementation(async () => {
                callOrder.push('findOtpCode')
                return validOtpRecord
            })
            mockAuthRepo.deleteOtpCode.mockImplementation(async () => {
                callOrder.push('deleteOtpCode')
            })
            mockHashingService.hash.mockImplementation(async () => {
                callOrder.push('hash')
                return 'hashed_password'
            })
            mockAuthRepo.createUser.mockImplementation(async () => {
                callOrder.push('createUser')
                return createdUser
            })

            await service.register(registerDto)

            expect(callOrder).toEqual([
                'findUniqueEmail',
                'findOtpCode',
                'deleteOtpCode',
                'findUniquePhone',
                'hash',
                'createUser',
            ])
        })

        it('should propagate errors from findUnique', async () => {
            const dbError = new Error('Database connection error')
            mockSharedUserRepo.findUnique.mockRejectedValue(dbError)

            await expect(service.register(registerDto)).rejects.toThrow(dbError)
        })

        it('should propagate errors from hash', async () => {
            const hashError = new Error('Hashing error')
            mockSharedUserRepo.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
            mockHashingService.hash.mockRejectedValue(hashError)

            await expect(service.register(registerDto)).rejects.toThrow(hashError)
        })

        it('should propagate errors from createUser', async () => {
            const createError = new Error('Failed to create user')
            mockSharedUserRepo.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
            mockHashingService.hash.mockResolvedValue('hashed_password')
            mockAuthRepo.createUser.mockRejectedValue(createError)

            await expect(service.register(registerDto)).rejects.toThrow(createError)
        })

        it('should handle different email formats correctly', async () => {
            const emails = [
                'test@example.com',
                'test.user@example.com',
                'test+tag@example.co.uk',
            ]

            for (const email of emails) {
                const dto = { ...registerDto, email }
                const createdUser = {
                    id: 1,
                    fullName: dto.fullName,
                    email: dto.email,
                    passwordHash: 'hashed_password',
                    phoneNumber: dto.phoneNumber,
                    role: Role.student,
                    isActive: true,
                    avatarMediaId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }

                mockSharedUserRepo.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
                mockAuthRepo.findOtpCode.mockResolvedValue({ ...validOtpRecord, email })
                mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
                mockHashingService.hash.mockResolvedValue('hashed_password')
                mockAuthRepo.createUser.mockResolvedValue(createdUser)

                await service.register(dto)

                expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ email })
                jest.clearAllMocks()
            }
        })

        it('should not store plain text password', async () => {
            const hashedPassword = 'hashed_password_123'
            const createdUser = {
                id: 1,
                fullName: registerDto.fullName,
                email: registerDto.email,
                passwordHash: hashedPassword,
                phoneNumber: registerDto.phoneNumber,
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockSharedUserRepo.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
            mockHashingService.hash.mockResolvedValue(hashedPassword)
            mockAuthRepo.createUser.mockResolvedValue(createdUser)

            await service.register(registerDto)

            expect(authRepo.createUser).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    password: registerDto.password,
                }),
            )
            expect(authRepo.createUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    passwordHash: hashedPassword,
                }),
            )
            expect(hashedPassword).not.toBe(registerDto.password)
        })
    })
})
