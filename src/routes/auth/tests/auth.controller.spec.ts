import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../auth.controller'
import { InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common'
import { Role } from '@prisma/client'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { SendOtpReqDto } from '../dtos/requests/send-otp-req.dto'
import { RegisterReqDto } from '../dtos/requests/register-req.dto'
import { LoginReqDto } from '../dtos/requests/login-req.dto'
import { RefreshTokenReqDto } from '../dtos/requests/refresh-token-req.dto'
import { LogoutReqDto } from '../dtos/requests/logout-req.dto'
import { ForgotPasswordReqDto } from '../dtos/requests/forgot-password-req'
import { ResetPasswordReqDto } from '../dtos/requests/reset-password.dto'
import { IAuthService } from '../services/auth.interface.service'

describe('AuthController', () => {
    let controller: AuthController
    let authService: IAuthService

    const mockAuthService = {
        sendOtpRegister: jest.fn(),
        register: jest.fn(),
        login: jest.fn(),
        refreshToken: jest.fn(),
        logout: jest.fn(),
        forgotPassword: jest.fn(),
        resetPassword: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: 'IAuthService',
                    useValue: mockAuthService,
                },
            ],
        }).compile()

        controller = module.get<AuthController>(AuthController)
        authService = module.get<IAuthService>('IAuthService')
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
        } as SendOtpReqDto

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

        it('should propagate errors from service', async () => {
            const error = new InternalServerErrorException('Đã xảy ra lỗi khi gửi mã OTP')
            mockAuthService.sendOtpRegister.mockRejectedValue(error)

            await expect(controller.sendOtp(validSendOtpDto)).rejects.toThrow(error)
        })
    })

    describe('register', () => {
        const validRegisterDto: RegisterReqDto = {
            email: 'test@example.com',
            password: 'Password123!',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            otpCode: '123456',
        } as RegisterReqDto

        const expectedUser = {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            passwordHash: 'hashed_password',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should register user successfully', async () => {
            mockAuthService.register.mockResolvedValue(expectedUser)

            const result = await controller.register(validRegisterDto)

            expect(authService.register).toHaveBeenCalledWith(validRegisterDto)
            expect(result).toEqual(expectedUser)
        })

        it('should throw error when email already exists', async () => {
            const error = new UnprocessableEntityException('Email đã tồn tại')
            mockAuthService.register.mockRejectedValue(error)

            await expect(controller.register(validRegisterDto)).rejects.toThrow(error)
        })

        it('should throw error when OTP is invalid', async () => {
            const error = new UnprocessableEntityException('Mã OTP không hợp lệ hoặc đã hết hạn')
            mockAuthService.register.mockRejectedValue(error)

            await expect(controller.register(validRegisterDto)).rejects.toThrow(error)
        })

        it('should throw error when phone number already exists', async () => {
            const error = new UnprocessableEntityException('Số điện thoại đã tồn tại')
            mockAuthService.register.mockRejectedValue(error)

            await expect(controller.register(validRegisterDto)).rejects.toThrow(error)
        })
    })

    describe('login', () => {
        const validLoginDto: LoginReqDto = {
            email: 'test@example.com',
            password: 'Password123!',
        } as LoginReqDto

        const expectedLoginResult = {
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
        }

        it('should login successfully', async () => {
            mockAuthService.login.mockResolvedValue(expectedLoginResult)

            const result = await controller.login(validLoginDto)

            expect(authService.login).toHaveBeenCalledWith(validLoginDto)
            expect(result).toEqual(expectedLoginResult)
        })

        it('should throw error when email does not exist', async () => {
            const error = new UnprocessableEntityException('Email hoặc mật khẩu không đúng')
            mockAuthService.login.mockRejectedValue(error)

            await expect(controller.login(validLoginDto)).rejects.toThrow(error)
        })

        it('should throw error when password is incorrect', async () => {
            const error = new UnprocessableEntityException('Email hoặc mật khẩu không đúng')
            mockAuthService.login.mockRejectedValue(error)

            await expect(controller.login(validLoginDto)).rejects.toThrow(error)
        })

        it('should throw error when account is inactive', async () => {
            const error = new UnprocessableEntityException('Tài khoản đã bị vô hiệu hóa')
            mockAuthService.login.mockRejectedValue(error)

            await expect(controller.login(validLoginDto)).rejects.toThrow(error)
        })
    })

    describe('refreshToken', () => {
        const validRefreshTokenDto: RefreshTokenReqDto = {
            refreshToken: 'valid_refresh_token',
        } as RefreshTokenReqDto

        const expectedTokenResult = {
            accessToken: 'new_access_token',
            refreshToken: 'new_refresh_token',
        }

        it('should refresh token successfully', async () => {
            mockAuthService.refreshToken.mockResolvedValue(expectedTokenResult)

            const result = await controller.refreshToken(validRefreshTokenDto)

            expect(authService.refreshToken).toHaveBeenCalledWith(validRefreshTokenDto)
            expect(result).toEqual(expectedTokenResult)
        })

        it('should throw error when refresh token is invalid', async () => {
            const error = new UnprocessableEntityException('Refresh token không hợp lệ')
            mockAuthService.refreshToken.mockRejectedValue(error)

            await expect(controller.refreshToken(validRefreshTokenDto)).rejects.toThrow(error)
        })

        it('should throw error when user does not exist', async () => {
            const error = new UnprocessableEntityException('Người dùng không tồn tại')
            mockAuthService.refreshToken.mockRejectedValue(error)

            await expect(controller.refreshToken(validRefreshTokenDto)).rejects.toThrow(error)
        })
    })

    describe('logout', () => {
        const validLogoutDto: LogoutReqDto = {
            refreshToken: 'valid_refresh_token',
        } as LogoutReqDto

        const expectedResponse: ResponseMessage = {
            message: 'Đăng xuất thành công.',
        }

        it('should logout successfully', async () => {
            mockAuthService.logout.mockResolvedValue(expectedResponse)

            const result = await controller.logout(validLogoutDto)

            expect(authService.logout).toHaveBeenCalledWith(validLogoutDto)
            expect(result).toEqual(expectedResponse)
        })

        it('should handle logout errors', async () => {
            const error = new InternalServerErrorException('Lỗi hệ thống')
            mockAuthService.logout.mockRejectedValue(error)

            await expect(controller.logout(validLogoutDto)).rejects.toThrow(error)
        })
    })

    describe('forgotPassword', () => {
        const validForgotPasswordDto: ForgotPasswordReqDto = {
            email: 'test@example.com',
        } as ForgotPasswordReqDto

        const expectedResponse: ResponseMessage = {
            message: 'Đã gửi mã xác thực quên mật khẩu.',
        }

        it('should send forgot password OTP successfully', async () => {
            mockAuthService.forgotPassword.mockResolvedValue(expectedResponse)

            const result = await controller.forgotPassword(validForgotPasswordDto)

            expect(authService.forgotPassword).toHaveBeenCalledWith(validForgotPasswordDto)
            expect(result).toEqual(expectedResponse)
        })

        it('should throw error when user does not exist', async () => {
            const error = new UnprocessableEntityException('Người dùng không tồn tại')
            mockAuthService.forgotPassword.mockRejectedValue(error)

            await expect(controller.forgotPassword(validForgotPasswordDto)).rejects.toThrow(error)
        })

        it('should handle internal server errors', async () => {
            const error = new InternalServerErrorException('Đã xảy ra lỗi khi gửi mã OTP. Vui lòng thử lại sau.')
            mockAuthService.forgotPassword.mockRejectedValue(error)

            await expect(controller.forgotPassword(validForgotPasswordDto)).rejects.toThrow(error)
        })
    })

    describe('resetPassword', () => {
        const validResetPasswordDto: ResetPasswordReqDto = {
            email: 'test@example.com',
            otpCode: '123456',
            newPassword: 'NewPassword123!',
        } as ResetPasswordReqDto

        const expectedResponse: ResponseMessage = {
            message: 'Đặt lại mật khẩu thành công.',
        }

        it('should reset password successfully', async () => {
            mockAuthService.resetPassword.mockResolvedValue(expectedResponse)

            const result = await controller.resetPassword(validResetPasswordDto)

            expect(authService.resetPassword).toHaveBeenCalledWith(validResetPasswordDto)
            expect(result).toEqual(expectedResponse)
        })

        it('should throw error when OTP is invalid', async () => {
            const error = new UnprocessableEntityException('Mã OTP không hợp lệ hoặc đã hết hạn')
            mockAuthService.resetPassword.mockRejectedValue(error)

            await expect(controller.resetPassword(validResetPasswordDto)).rejects.toThrow(error)
        })

        it('should throw error when user does not exist', async () => {
            const error = new UnprocessableEntityException('Người dùng không tồn tại')
            mockAuthService.resetPassword.mockRejectedValue(error)

            await expect(controller.resetPassword(validResetPasswordDto)).rejects.toThrow(error)
        })
    })
})
