import { Test, TestingModule } from '@nestjs/testing'
import { ProfileController } from '../profile.controller'
import { IProfileService } from '../services/profile.interface.service'
import { GetUserParamDto } from 'src/shared/dtos/get-user-param.dto'
import { Role } from '@prisma/client'

describe('ProfileController', () => {
    let controller: ProfileController
    let profileService: IProfileService

    const mockProfileService = {
        updateProfile: jest.fn(),
        changePassword: jest.fn(),
    }

    const mockCurrentUser: GetUserParamDto = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '0123456789',
        role: Role.student,
        avatarMediaId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    const mockUserResponse = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '0123456789',
        role: Role.student,
        avatarMediaId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProfileController],
            providers: [
                {
                    provide: 'IProfileService',
                    useValue: mockProfileService,
                },
            ],
        }).compile()

        controller = module.get<ProfileController>(ProfileController)
        profileService = module.get<IProfileService>('IProfileService')
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('getProfile', () => {
        it('should return current user profile', async () => {
            const result = await controller.getProfile(mockCurrentUser)

            expect(result).toEqual(mockCurrentUser)
        })

        it('should return user with correct id', async () => {
            const user: GetUserParamDto = {
                id: 2,
                email: 'another@example.com',
                fullName: 'Another User',
                phoneNumber: '0987654321',
                role: Role.admin,
                avatarMediaId: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const result = await controller.getProfile(user)

            expect(result).toEqual(user)
            expect(result.id).toBe(2)
            expect(result.email).toBe('another@example.com')
            expect(result.role).toBe(Role.admin)
        })

        it('should return user profile for student role', async () => {
            const studentUser: GetUserParamDto = {
                id: 3,
                email: 'student@example.com',
                fullName: 'Student User',
                phoneNumber: '0111111111',
                role: Role.student,
                avatarMediaId: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const result = await controller.getProfile(studentUser)

            expect(result.role).toBe(Role.student)
        })

        it('should return user profile for admin role', async () => {
            const adminUser: GetUserParamDto = {
                id: 4,
                email: 'admin@example.com',
                fullName: 'Admin User',
                phoneNumber: '0222222222',
                role: Role.admin,
                avatarMediaId: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const result = await controller.getProfile(adminUser)

            expect(result.role).toBe(Role.admin)
        })

        it('should return user with avatarMediaId', async () => {
            const userWithAvatar: GetUserParamDto = {
                id: 5,
                email: 'user@example.com',
                fullName: 'User With Avatar',
                phoneNumber: '0333333333',
                role: Role.student,
                avatarMediaId: 123,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const result = await controller.getProfile(userWithAvatar)

            expect(result.avatarMediaId).toBe(123)
        })
    })

    describe('updateProfile', () => {
        it('should update profile successfully with all fields', async () => {
            const updateData = {
                fullName: 'Updated Name',
                phoneNumber: '0987654321',
                avatarMediaId: 123,
            }

            const updatedUser = {
                ...mockUserResponse,
                ...updateData,
            }

            mockProfileService.updateProfile.mockResolvedValue(updatedUser)

            const result = await controller.updateProfile(mockCurrentUser, updateData)

            expect(profileService.updateProfile).toHaveBeenCalledWith(mockCurrentUser.id, updateData)
            expect(result).toEqual(updatedUser)
        })

        it('should update profile with only fullName', async () => {
            const updateData = {
                fullName: 'New Name',
                phoneNumber: '0123456789',
                avatarMediaId: null,
            }

            const updatedUser = {
                ...mockUserResponse,
                fullName: updateData.fullName,
            }

            mockProfileService.updateProfile.mockResolvedValue(updatedUser)

            const result = await controller.updateProfile(mockCurrentUser, updateData)

            expect(profileService.updateProfile).toHaveBeenCalledWith(mockCurrentUser.id, updateData)
            expect(result.fullName).toBe('New Name')
        })

        it('should update profile with null avatarMediaId', async () => {
            const updateData = {
                fullName: 'Updated Name',
                phoneNumber: '0987654321',
                avatarMediaId: null,
            }

            const updatedUser = {
                ...mockUserResponse,
                ...updateData,
            }

            mockProfileService.updateProfile.mockResolvedValue(updatedUser)

            const result = await controller.updateProfile(mockCurrentUser, updateData)

            expect(profileService.updateProfile).toHaveBeenCalledWith(mockCurrentUser.id, updateData)
            expect(result.avatarMediaId).toBeNull()
        })

        it('should call service with correct user id', async () => {
            const user: GetUserParamDto = {
                id: 99,
                email: 'test99@example.com',
                fullName: 'Test User 99',
                phoneNumber: '0999999999',
                role: Role.student,
                avatarMediaId: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const updateData = {
                fullName: 'Test',
                phoneNumber: '0123456789',
                avatarMediaId: null,
            }

            mockProfileService.updateProfile.mockResolvedValue({
                ...mockUserResponse,
                id: 99,
            })

            await controller.updateProfile(user, updateData)

            expect(profileService.updateProfile).toHaveBeenCalledWith(99, updateData)
        })

        it('should handle service errors', async () => {
            const updateData = {
                fullName: 'Updated Name',
                phoneNumber: '0987654321',
                avatarMediaId: null,
            }

            mockProfileService.updateProfile.mockRejectedValue(new Error('Service error'))

            await expect(controller.updateProfile(mockCurrentUser, updateData)).rejects.toThrow('Service error')
            expect(profileService.updateProfile).toHaveBeenCalledWith(mockCurrentUser.id, updateData)
        })

        it('should update profile with valid phone number format', async () => {
            const updateData = {
                fullName: 'Updated Name',
                phoneNumber: '0123456789',
                avatarMediaId: null,
            }

            const updatedUser = {
                ...mockUserResponse,
                phoneNumber: '0123456789',
            }

            mockProfileService.updateProfile.mockResolvedValue(updatedUser)

            const result = await controller.updateProfile(mockCurrentUser, updateData)

            expect(result.phoneNumber).toBe('0123456789')
        })

        it('should update profile with positive avatarMediaId', async () => {
            const updateData = {
                fullName: 'Updated Name',
                phoneNumber: '0987654321',
                avatarMediaId: 999,
            }

            const updatedUser = {
                ...mockUserResponse,
                avatarMediaId: 999,
            }

            mockProfileService.updateProfile.mockResolvedValue(updatedUser)

            const result = await controller.updateProfile(mockCurrentUser, updateData)

            expect(result.avatarMediaId).toBe(999)
        })
    })

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const changePasswordData = {
                currentPassword: 'oldPassword123',
                newPassword: 'newPassword123',
                confirmPassword: 'newPassword123',
            }

            mockProfileService.changePassword.mockResolvedValue({
                message: 'Đổi mật khẩu thành công',
            })

            const result = await controller.changePassword(mockCurrentUser, changePasswordData)

            expect(profileService.changePassword).toHaveBeenCalledWith(mockCurrentUser.id, changePasswordData)
            expect(result).toEqual({ message: 'Đổi mật khẩu thành công' })
        })

        it('should call service with correct user id', async () => {
            const user: GetUserParamDto = {
                id: 50,
                email: 'user50@example.com',
                fullName: 'User 50',
                phoneNumber: '0500000000',
                role: Role.student,
                avatarMediaId: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const changePasswordData = {
                currentPassword: 'oldPassword123',
                newPassword: 'newPassword456',
                confirmPassword: 'newPassword456',
            }

            mockProfileService.changePassword.mockResolvedValue({
                message: 'Đổi mật khẩu thành công',
            })

            await controller.changePassword(user, changePasswordData)

            expect(profileService.changePassword).toHaveBeenCalledWith(50, changePasswordData)
        })

        it('should handle password change errors', async () => {
            const changePasswordData = {
                currentPassword: 'wrongPassword',
                newPassword: 'newPassword123',
                confirmPassword: 'newPassword123',
            }

            mockProfileService.changePassword.mockRejectedValue(new Error('Mật khẩu hiện tại không đúng'))

            await expect(controller.changePassword(mockCurrentUser, changePasswordData)).rejects.toThrow(
                'Mật khẩu hiện tại không đúng',
            )
            expect(profileService.changePassword).toHaveBeenCalledWith(mockCurrentUser.id, changePasswordData)
        })

        it('should handle user not found error', async () => {
            const changePasswordData = {
                currentPassword: 'oldPassword123',
                newPassword: 'newPassword123',
                confirmPassword: 'newPassword123',
            }

            mockProfileService.changePassword.mockRejectedValue(new Error('Người dùng không tồn tại'))

            await expect(controller.changePassword(mockCurrentUser, changePasswordData)).rejects.toThrow(
                'Người dùng không tồn tại',
            )
        })

        it('should pass all password fields to service', async () => {
            const changePasswordData = {
                currentPassword: 'current123',
                newPassword: 'new123456',
                confirmPassword: 'new123456',
            }

            mockProfileService.changePassword.mockResolvedValue({
                message: 'Đổi mật khẩu thành công',
            })

            await controller.changePassword(mockCurrentUser, changePasswordData)

            expect(profileService.changePassword).toHaveBeenCalledWith(mockCurrentUser.id, {
                currentPassword: 'current123',
                newPassword: 'new123456',
                confirmPassword: 'new123456',
            })
        })

        it('should work with minimum password length', async () => {
            const changePasswordData = {
                currentPassword: '123456',
                newPassword: 'abc123',
                confirmPassword: 'abc123',
            }

            mockProfileService.changePassword.mockResolvedValue({
                message: 'Đổi mật khẩu thành công',
            })

            const result = await controller.changePassword(mockCurrentUser, changePasswordData)

            expect(result.message).toBe('Đổi mật khẩu thành công')
        })

        it('should work with maximum password length', async () => {
            const longPassword = 'a'.repeat(100)
            const changePasswordData = {
                currentPassword: longPassword,
                newPassword: longPassword,
                confirmPassword: longPassword,
            }

            mockProfileService.changePassword.mockResolvedValue({
                message: 'Đổi mật khẩu thành công',
            })

            const result = await controller.changePassword(mockCurrentUser, changePasswordData)

            expect(result.message).toBe('Đổi mật khẩu thành công')
        })

        it('should return message in Vietnamese', async () => {
            const changePasswordData = {
                currentPassword: 'oldPassword123',
                newPassword: 'newPassword123',
                confirmPassword: 'newPassword123',
            }

            mockProfileService.changePassword.mockResolvedValue({
                message: 'Đổi mật khẩu thành công',
            })

            const result = await controller.changePassword(mockCurrentUser, changePasswordData)

            expect(result.message).toContain('Đổi mật khẩu thành công')
        })
    })
})
