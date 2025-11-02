import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { RegisterReqDto, SendOtpReqDto } from './auth.dto'
import { InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common'
import { Role } from '@prisma/client'
import { ResponseMessage } from 'src/shared/types/response-message.type'

describe('AuthController', () => {
    let controller: AuthController
    let authService: AuthService

    const mockAuthService = {
        sendOtpRegister: jest.fn(),
        register: jest.fn(),
        sendOtp: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile()

        controller = module.get<AuthController>(AuthController)
        authService = module.get<AuthService>(AuthService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('sendOtp', () => {
        const validSendOtpDto: SendOtpReqDto = {
            email: 'test@example.com',
        }

        const expectedResponse: ResponseMessage = {
            message: 'Mã OTP đã được gửi đến email của bạn.',
        }

        it('should send OTP successfully', async () => {
            mockAuthService.sendOtpRegister.mockResolvedValue(expectedResponse)

            const result = await controller.sendOtp(validSendOtpDto)

            expect(authService.sendOtpRegister).toHaveBeenCalledWith(validSendOtpDto)
            expect(authService.sendOtpRegister).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should call authService.sendOtpRegister with correct email', async () => {
            mockAuthService.sendOtpRegister.mockResolvedValue(expectedResponse)

            await controller.sendOtp(validSendOtpDto)

            expect(authService.sendOtpRegister).toHaveBeenCalledWith(validSendOtpDto)
        })

        it('should return success message when OTP is sent', async () => {
            mockAuthService.sendOtpRegister.mockResolvedValue(expectedResponse)

            const result = await controller.sendOtp(validSendOtpDto)

            expect(result).toHaveProperty('message')
            expect(result.message).toBe('Mã OTP đã được gửi đến email của bạn.')
        })

        it('should handle different email addresses', async () => {
            const differentEmailDto: SendOtpReqDto = {
                email: 'another.user@example.com',
            }

            mockAuthService.sendOtpRegister.mockResolvedValue(expectedResponse)

            const result = await controller.sendOtp(differentEmailDto)

            expect(result).toEqual(expectedResponse)
            expect(authService.sendOtpRegister).toHaveBeenCalledWith(differentEmailDto)
        })

        it('should handle email with special characters', async () => {
            const specialEmailDto: SendOtpReqDto = {
                email: 'user+test@example.co.uk',
            }

            mockAuthService.sendOtpRegister.mockResolvedValue(expectedResponse)

            const result = await controller.sendOtp(specialEmailDto)

            expect(result).toEqual(expectedResponse)
            expect(authService.sendOtpRegister).toHaveBeenCalledWith(specialEmailDto)
        })

        it('should throw InternalServerErrorException when email service fails', async () => {
            mockAuthService.sendOtpRegister.mockRejectedValue(
                new InternalServerErrorException('Đã xảy ra lỗi khi gửi mã OTP'),
            )

            await expect(controller.sendOtp(validSendOtpDto)).rejects.toThrow(
                InternalServerErrorException,
            )
            await expect(controller.sendOtp(validSendOtpDto)).rejects.toThrow(
                'Đã xảy ra lỗi khi gửi mã OTP',
            )
        })

        it('should propagate errors from authService', async () => {
            const error = new Error('Network error')
            mockAuthService.sendOtpRegister.mockRejectedValue(error)

            await expect(controller.sendOtp(validSendOtpDto)).rejects.toThrow(error)
            expect(authService.sendOtpRegister).toHaveBeenCalledWith(validSendOtpDto)
        })

        it('should handle multiple OTP requests', async () => {
            mockAuthService.sendOtpRegister.mockResolvedValue(expectedResponse)

            await controller.sendOtp(validSendOtpDto)
            await controller.sendOtp(validSendOtpDto)

            expect(authService.sendOtpRegister).toHaveBeenCalledTimes(2)
        })
    })

    describe('register', () => {
        const validRegisterDto: RegisterReqDto = {
            fullName: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            phoneNumber: '0123456789',
            otpCode: '123456',
        }

        const expectedUserResult = {
            id: 1,
            fullName: 'Test User',
            email: 'test@example.com',
            phoneNumber: '0123456789',
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
        }

        it('should register a new user successfully', async () => {
            mockAuthService.register.mockResolvedValue(expectedUserResult)

            const result = await controller.register(validRegisterDto)

            expect(authService.register).toHaveBeenCalledWith(validRegisterDto)
            expect(authService.register).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedUserResult)
        })

        it('should call authService.register with correct parameters', async () => {
            const registerDto: RegisterReqDto = {
                fullName: 'Another User',
                email: 'another@example.com',
                password: 'securepass',
                confirmPassword: 'securepass',
                phoneNumber: '0987654321',
                otpCode: '654321',
            }

            mockAuthService.register.mockResolvedValue({
                ...expectedUserResult,
                id: 2,
                fullName: 'Another User',
                email: 'another@example.com',
                phoneNumber: '0987654321',
            })

            await controller.register(registerDto)

            expect(authService.register).toHaveBeenCalledWith(registerDto)
        })

        it('should return user without passwordHash', async () => {
            mockAuthService.register.mockResolvedValue(expectedUserResult)

            const result = await controller.register(validRegisterDto)

            expect(result).not.toHaveProperty('passwordHash')
            expect(result).toHaveProperty('id')
            expect(result).toHaveProperty('email')
            expect(result).toHaveProperty('fullName')
            expect(result).toHaveProperty('phoneNumber')
            expect(result).toHaveProperty('role')
        })

        it('should handle registration with different user data', async () => {
            const differentDto: RegisterReqDto = {
                fullName: 'John Doe',
                email: 'john.doe@test.com',
                password: 'strongPassword123',
                confirmPassword: 'strongPassword123',
                phoneNumber: '0912345678',
                otpCode: '999888',
            }

            const expectedResult = {
                id: 3,
                fullName: 'John Doe',
                email: 'john.doe@test.com',
                phoneNumber: '0912345678',
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date('2025-01-02'),
                updatedAt: new Date('2025-01-02'),
            }

            mockAuthService.register.mockResolvedValue(expectedResult)

            const result = await controller.register(differentDto)

            expect(result).toEqual(expectedResult)
            expect(authService.register).toHaveBeenCalledWith(differentDto)
        })

        it('should throw UnprocessableEntityException when email already exists', async () => {
            mockAuthService.register.mockRejectedValue(
                new UnprocessableEntityException('Email đã tồn tại'),
            )

            await expect(controller.register(validRegisterDto)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(controller.register(validRegisterDto)).rejects.toThrow(
                'Email đã tồn tại',
            )
            expect(authService.register).toHaveBeenCalledWith(validRegisterDto)
        })

        it('should throw UnprocessableEntityException when phone number already exists', async () => {
            mockAuthService.register.mockRejectedValue(
                new UnprocessableEntityException('Số điện thoại đã tồn tại'),
            )

            await expect(controller.register(validRegisterDto)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(controller.register(validRegisterDto)).rejects.toThrow(
                'Số điện thoại đã tồn tại',
            )
        })

        it('should throw UnprocessableEntityException when OTP is invalid', async () => {
            mockAuthService.register.mockRejectedValue(
                new UnprocessableEntityException('Mã OTP không hợp lệ hoặc đã hết hạn'),
            )

            await expect(controller.register(validRegisterDto)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(controller.register(validRegisterDto)).rejects.toThrow(
                'Mã OTP không hợp lệ hoặc đã hết hạn',
            )
        })

        it('should propagate errors from authService', async () => {
            const error = new Error('Database connection failed')
            mockAuthService.register.mockRejectedValue(error)

            await expect(controller.register(validRegisterDto)).rejects.toThrow(error)
            expect(authService.register).toHaveBeenCalledWith(validRegisterDto)
        })

        it('should handle registration with minimum valid password length', async () => {
            const minPasswordDto: RegisterReqDto = {
                fullName: 'Min Pass User',
                email: 'minpass@example.com',
                password: '123456', // minimum 6 characters
                confirmPassword: '123456',
                phoneNumber: '0123456789',
                otpCode: '111111',
            }

            mockAuthService.register.mockResolvedValue({
                ...expectedUserResult,
                fullName: 'Min Pass User',
                email: 'minpass@example.com',
            })

            const result = await controller.register(minPasswordDto)

            expect(result).toBeDefined()
            expect(authService.register).toHaveBeenCalledWith(minPasswordDto)
        })

        it('should handle registration with long names and phone numbers', async () => {
            const longDataDto: RegisterReqDto = {
                fullName: 'Very Long Full Name That Is Still Valid',
                email: 'longname@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                phoneNumber: '0123456789',
                otpCode: '222222',
            }

            mockAuthService.register.mockResolvedValue({
                ...expectedUserResult,
                fullName: 'Very Long Full Name That Is Still Valid',
                email: 'longname@example.com',
            })

            const result = await controller.register(longDataDto)

            expect(result.fullName).toBe('Very Long Full Name That Is Still Valid')
            expect(authService.register).toHaveBeenCalledWith(longDataDto)
        })

        it('should ensure returned user has student role by default', async () => {
            mockAuthService.register.mockResolvedValue(expectedUserResult)

            const result = await controller.register(validRegisterDto)

            expect(result.role).toBe(Role.student)
        })

        it('should return user with timestamps', async () => {
            mockAuthService.register.mockResolvedValue(expectedUserResult)

            const result = await controller.register(validRegisterDto)

            expect(result).toHaveProperty('createdAt')
            expect(result).toHaveProperty('updatedAt')
            expect(result.createdAt).toBeInstanceOf(Date)
            expect(result.updatedAt).toBeInstanceOf(Date)
        })

        it('should handle registration with valid 6-digit OTP code', async () => {
            const validOtpDto: RegisterReqDto = {
                ...validRegisterDto,
                otpCode: '123456',
            }

            mockAuthService.register.mockResolvedValue(expectedUserResult)

            const result = await controller.register(validOtpDto)

            expect(result).toBeDefined()
            expect(authService.register).toHaveBeenCalledWith(validOtpDto)
        })

        it('should handle registration with different valid OTP codes', async () => {
            const otpCodes = ['000000', '999999', '123456', '654321']

            for (const otpCode of otpCodes) {
                const dto: RegisterReqDto = {
                    ...validRegisterDto,
                    otpCode,
                }

                mockAuthService.register.mockResolvedValue(expectedUserResult)
                await controller.register(dto)

                expect(authService.register).toHaveBeenCalledWith(dto)
            }
        })

        it('should handle registration with email containing dots and special characters', async () => {
            const specialEmailDto: RegisterReqDto = {
                fullName: 'Test User',
                email: 'test.user+tag@example.co.uk',
                password: 'password123',
                confirmPassword: 'password123',
                phoneNumber: '0123456789',
                otpCode: '333333',
            }

            mockAuthService.register.mockResolvedValue({
                ...expectedUserResult,
                email: 'test.user+tag@example.co.uk',
            })

            const result = await controller.register(specialEmailDto)

            expect(result.email).toBe('test.user+tag@example.co.uk')
            expect(authService.register).toHaveBeenCalledWith(specialEmailDto)
        })

        it('should ensure all required fields are passed to service', async () => {
            mockAuthService.register.mockResolvedValue(expectedUserResult)

            await controller.register(validRegisterDto)

            const callArgs = mockAuthService.register.mock.calls[0][0]
            expect(callArgs).toHaveProperty('email')
            expect(callArgs).toHaveProperty('fullName')
            expect(callArgs).toHaveProperty('password')
            expect(callArgs).toHaveProperty('confirmPassword')
            expect(callArgs).toHaveProperty('phoneNumber')
            expect(callArgs).toHaveProperty('otpCode')
        })

        it('should not modify the input DTO', async () => {
            const originalDto = { ...validRegisterDto }
            mockAuthService.register.mockResolvedValue(expectedUserResult)

            await controller.register(validRegisterDto)

            expect(validRegisterDto).toEqual(originalDto)
        })
    })
})
