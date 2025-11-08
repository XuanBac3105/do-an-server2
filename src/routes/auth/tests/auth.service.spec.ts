import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../services/auth.service'
import { IAuthRepo } from '../repos/auth.interface.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo'
import { EmailService } from 'src/shared/services/email.service'
import { TokenService } from 'src/shared/services/token.service'
import { InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common'
import { OtpCodeType, Role } from '@prisma/client'

describe('AuthService', () => {
    let service: AuthService
    let authRepo: IAuthRepo
    let hashingService: HashingService
    let sharedUserRepo: SharedUserRepo
    let emailService: EmailService
    let tokenService: TokenService

    const mockAuthRepo = {
        createUser: jest.fn(),
        createOtpCode: jest.fn(),
        findOtpCode: jest.fn(),
        deleteOtpCode: jest.fn(),
        createRefreshToken: jest.fn(),
        findRefreshToken: jest.fn(),
        deleteRefreshToken: jest.fn(),
    }

    const mockHashingService = {
        hash: jest.fn(),
        compare: jest.fn(),
    }

    const mockSharedUserRepo = {
        findUnique: jest.fn(),
        updateUser: jest.fn(),
    }

    const mockEmailService = {
        sendEmail: jest.fn(),
    }

    const mockTokenService = {
        signAccessToken: jest.fn(),
        signRefreshToken: jest.fn(),
        verifyRefreshToken: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: 'IAuthRepo',
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
                {
                    provide: TokenService,
                    useValue: mockTokenService,
                },
            ],
        }).compile()

        service = module.get<AuthService>(AuthService)
        authRepo = module.get<IAuthRepo>('IAuthRepo')
        hashingService = module.get<HashingService>(HashingService)
        sharedUserRepo = module.get<SharedUserRepo>(SharedUserRepo)
        emailService = module.get<EmailService>(EmailService)
        tokenService = module.get<TokenService>(TokenService)
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
    })

    describe('sendOtpRegister', () => {
        const sendOtpDto = {
            email: 'test@example.com',
        }

        it('should send OTP for registration successfully', async () => {
            mockAuthRepo.createOtpCode.mockResolvedValue(undefined)
            mockEmailService.sendEmail.mockResolvedValue(undefined)

            const result = await service.sendOtpRegister(sendOtpDto)

            expect(authRepo.createOtpCode).toHaveBeenCalled()
            expect(result).toEqual({ message: 'Mã OTP đã được gửi đến email của bạn.' })
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
    })

    describe('register', () => {
        const registerDto = {
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

        const expectedUser = {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            passwordHash: 'hashed_password',
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should register a new user successfully', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
            mockHashingService.hash.mockResolvedValue('hashed_password')
            mockAuthRepo.createUser.mockResolvedValue(expectedUser)

            const result = await service.register(registerDto)

            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ email: registerDto.email })
            expect(authRepo.findOtpCode).toHaveBeenCalledWith({
                email: registerDto.email,
                otpCode: registerDto.otpCode,
                codeType: OtpCodeType.email_verification,
            })
            expect(authRepo.deleteOtpCode).toHaveBeenCalledWith({ email: registerDto.email })
            expect(hashingService.hash).toHaveBeenCalledWith(registerDto.password)
            expect(authRepo.createUser).toHaveBeenCalledWith({
                email: registerDto.email,
                passwordHash: 'hashed_password',
                phoneNumber: registerDto.phoneNumber,
                fullName: registerDto.fullName,
            })
            expect(result).toEqual(expectedUser)
        })

        it('should throw error when email already exists', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(expectedUser)

            await expect(service.register(registerDto)).rejects.toThrow(
                new UnprocessableEntityException('Email đã tồn tại'),
            )
        })

        it('should throw error when OTP is invalid', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(null)
            mockAuthRepo.findOtpCode.mockResolvedValue(null)

            await expect(service.register(registerDto)).rejects.toThrow(
                new UnprocessableEntityException('Mã OTP không hợp lệ hoặc đã hết hạn'),
            )
        })

        it('should throw error when phone number already exists', async () => {
            mockSharedUserRepo.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(expectedUser)
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)

            await expect(service.register(registerDto)).rejects.toThrow(
                new UnprocessableEntityException('Số điện thoại đã tồn tại'),
            )
        })
    })

    describe('login', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'password123',
        }

        const existingUser = {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            passwordHash: 'hashed_password',
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should login successfully with valid credentials', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(existingUser)
            mockHashingService.compare.mockResolvedValue(true)
            mockTokenService.signAccessToken.mockResolvedValue('access_token')
            mockTokenService.signRefreshToken.mockResolvedValue('refresh_token')
            mockTokenService.verifyRefreshToken.mockResolvedValue({ userId: 1, exp: Date.now() / 1000 + 3600 })
            mockAuthRepo.createRefreshToken.mockResolvedValue(undefined)

            const result = await service.login(loginDto)

            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ email: loginDto.email })
            expect(hashingService.compare).toHaveBeenCalledWith(loginDto.password, existingUser.passwordHash)
            expect(result).toEqual({
                accessToken: 'access_token',
                refreshToken: 'refresh_token',
            })
        })

        it('should throw error when email does not exist', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(null)

            await expect(service.login(loginDto)).rejects.toThrow(
                new UnprocessableEntityException('Email hoặc mật khẩu không đúng'),
            )
        })

        it('should throw error when password is incorrect', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(existingUser)
            mockHashingService.compare.mockResolvedValue(false)

            await expect(service.login(loginDto)).rejects.toThrow(
                new UnprocessableEntityException('Email hoặc mật khẩu không đúng'),
            )
        })

        it('should throw error when account is inactive', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue({ ...existingUser, isActive: false })
            mockHashingService.compare.mockResolvedValue(true)

            await expect(service.login(loginDto)).rejects.toThrow(
                new UnprocessableEntityException('Tài khoản đã bị vô hiệu hóa'),
            )
        })
    })

    describe('refreshToken', () => {
        const refreshTokenDto = {
            refreshToken: 'valid_refresh_token',
        }

        const existingRefreshToken = {
            id: BigInt(1),
            token: 'valid_refresh_token',
            userId: 1,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 3600000),
        }

        const existingUser = {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            passwordHash: 'hashed_password',
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should refresh token successfully', async () => {
            mockAuthRepo.findRefreshToken.mockResolvedValue(existingRefreshToken)
            mockTokenService.verifyRefreshToken.mockResolvedValue({ userId: 1, exp: Date.now() / 1000 + 3600 })
            mockSharedUserRepo.findUnique.mockResolvedValue(existingUser)
            mockAuthRepo.deleteRefreshToken.mockResolvedValue(undefined)
            mockTokenService.signAccessToken.mockResolvedValue('new_access_token')
            mockTokenService.signRefreshToken.mockResolvedValue('new_refresh_token')
            mockAuthRepo.createRefreshToken.mockResolvedValue(undefined)

            const result = await service.refreshToken(refreshTokenDto)

            expect(authRepo.findRefreshToken).toHaveBeenCalledWith({ token: refreshTokenDto.refreshToken })
            expect(authRepo.deleteRefreshToken).toHaveBeenCalledWith({ token: refreshTokenDto.refreshToken })
            expect(result).toEqual({
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token',
            })
        })

        it('should throw error when refresh token is invalid', async () => {
            mockAuthRepo.findRefreshToken.mockResolvedValue(null)

            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
                new UnprocessableEntityException('Refresh token không hợp lệ'),
            )
        })

        it('should throw error when user does not exist', async () => {
            mockAuthRepo.findRefreshToken.mockResolvedValue(existingRefreshToken)
            mockTokenService.verifyRefreshToken.mockResolvedValue({ userId: 1, exp: Date.now() / 1000 + 3600 })
            mockSharedUserRepo.findUnique.mockResolvedValue(null)

            await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
                new UnprocessableEntityException('Người dùng không tồn tại'),
            )
        })
    })

    describe('logout', () => {
        const logoutDto = {
            refreshToken: 'valid_refresh_token',
        }

        it('should logout successfully', async () => {
            mockAuthRepo.deleteRefreshToken.mockResolvedValue(undefined)

            const result = await service.logout(logoutDto)

            expect(authRepo.deleteRefreshToken).toHaveBeenCalledWith({ token: logoutDto.refreshToken })
            expect(result).toEqual({ message: 'Đăng xuất thành công.' })
        })
    })

    describe('forgotPassword', () => {
        const forgotPasswordDto = {
            email: 'test@example.com',
        }

        const existingUser = {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            passwordHash: 'hashed_password',
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should send forgot password OTP successfully', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(existingUser)
            mockAuthRepo.createOtpCode.mockResolvedValue(undefined)
            mockEmailService.sendEmail.mockResolvedValue(undefined)

            const result = await service.forgotPassword(forgotPasswordDto)

            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ email: forgotPasswordDto.email })
            expect(authRepo.createOtpCode).toHaveBeenCalled()
            expect(result).toEqual({ message: 'Đã gửi mã xác thực quên mật khẩu.' })
        })

        it('should throw error when user does not exist', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(null)

            await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(
                new InternalServerErrorException('Đã xảy ra lỗi khi gửi mã OTP. Vui lòng thử lại sau.'),
            )
        })

        it('should throw InternalServerErrorException on email service error', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(existingUser)
            mockAuthRepo.createOtpCode.mockRejectedValue(new Error('Email service error'))

            await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(
                new InternalServerErrorException('Đã xảy ra lỗi khi gửi mã OTP. Vui lòng thử lại sau.'),
            )
        })
    })

    describe('resetPassword', () => {
        const resetPasswordDto = {
            email: 'test@example.com',
            otpCode: '123456',
            newPassword: 'newPassword123',
            confirmNewPassword: 'newPassword123',
        }

        const validOtpRecord = {
            id: BigInt(1),
            email: 'test@example.com',
            otpCode: '123456',
            codeType: OtpCodeType.password_reset,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        }

        const existingUser = {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            passwordHash: 'hashed_password',
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should reset password successfully', async () => {
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
            mockSharedUserRepo.findUnique.mockResolvedValue(existingUser)
            mockHashingService.hash.mockResolvedValue('new_hashed_password')
            mockSharedUserRepo.updateUser.mockResolvedValue(undefined)
            mockAuthRepo.deleteRefreshToken.mockResolvedValue(undefined)

            const result = await service.resetPassword(resetPasswordDto)

            expect(authRepo.findOtpCode).toHaveBeenCalledWith({
                email: resetPasswordDto.email,
                otpCode: resetPasswordDto.otpCode,
                codeType: OtpCodeType.password_reset,
            })
            expect(authRepo.deleteOtpCode).toHaveBeenCalledWith({ email: resetPasswordDto.email })
            expect(hashingService.hash).toHaveBeenCalledWith(resetPasswordDto.newPassword)
            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: existingUser.id,
                passwordHash: 'new_hashed_password',
            })
            expect(result).toEqual({ message: 'Đặt lại mật khẩu thành công.' })
        })

        it('should throw error when OTP is invalid', async () => {
            mockAuthRepo.findOtpCode.mockResolvedValue(null)

            await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
                new UnprocessableEntityException('Mã OTP không hợp lệ hoặc đã hết hạn'),
            )
        })

        it('should throw error when user does not exist', async () => {
            mockAuthRepo.findOtpCode.mockResolvedValue(validOtpRecord)
            mockAuthRepo.deleteOtpCode.mockResolvedValue(undefined)
            mockSharedUserRepo.findUnique.mockResolvedValue(null)

            await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
                new UnprocessableEntityException('Người dùng không tồn tại'),
            )
        })
    })
})
