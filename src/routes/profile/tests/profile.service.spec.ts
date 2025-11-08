import { Test, TestingModule } from '@nestjs/testing'
import { ProfileService } from '../services/profile.service'
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { UnprocessableEntityException } from '@nestjs/common'
import { Role } from '@prisma/client'

describe('ProfileService', () => {
    let service: ProfileService
    let sharedUserRepo: SharedUserRepo
    let hashingService: HashingService

    const mockSharedUserRepo = {
        updateUser: jest.fn(),
        findUnique: jest.fn(),
    }

    const mockHashingService = {
        hash: jest.fn(),
        compare: jest.fn(),
    }

    const mockUser = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '0123456789',
        passwordHash: 'hashedPassword',
        role: Role.student,
        avatarMediaId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProfileService,
                {
                    provide: SharedUserRepo,
                    useValue: mockSharedUserRepo,
                },
                {
                    provide: HashingService,
                    useValue: mockHashingService,
                },
            ],
        }).compile()

        service = module.get<ProfileService>(ProfileService)
        sharedUserRepo = module.get<SharedUserRepo>(SharedUserRepo)
        hashingService = module.get<HashingService>(HashingService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('updateProfile', () => {
        it('should update user profile successfully', async () => {
            const userId = 1
            const updateData = {
                fullName: 'Updated Name',
                phoneNumber: '0987654321',
                avatarMediaId: 123,
            }

            const updatedUser = {
                ...mockUser,
                ...updateData,
            }

            mockSharedUserRepo.updateUser.mockResolvedValue(updatedUser)

            const result = await service.updateProfile(userId, updateData)

            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                fullName: updateData.fullName,
                phoneNumber: updateData.phoneNumber,
                avatarMediaId: updateData.avatarMediaId,
            })
            expect(result).toEqual(updatedUser)
        })

        it('should update user profile with partial data', async () => {
            const userId = 1
            const updateData = {
                fullName: 'Updated Name',
                phoneNumber: '0123456789',
                avatarMediaId: null,
            }

            const updatedUser = {
                ...mockUser,
                fullName: updateData.fullName,
            }

            mockSharedUserRepo.updateUser.mockResolvedValue(updatedUser)

            const result = await service.updateProfile(userId, updateData)

            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                fullName: updateData.fullName,
                phoneNumber: updateData.phoneNumber,
                avatarMediaId: updateData.avatarMediaId,
            })
            expect(result).toEqual(updatedUser)
        })

        it('should update user profile with null avatarMediaId', async () => {
            const userId = 1
            const updateData = {
                fullName: 'Updated Name',
                phoneNumber: '0987654321',
                avatarMediaId: null,
            }

            const updatedUser = {
                ...mockUser,
                ...updateData,
            }

            mockSharedUserRepo.updateUser.mockResolvedValue(updatedUser)

            const result = await service.updateProfile(userId, updateData)

            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                fullName: updateData.fullName,
                phoneNumber: updateData.phoneNumber,
                avatarMediaId: null,
            })
            expect(result).toEqual(updatedUser)
        })

        it('should throw error when update fails', async () => {
            const userId = 1
            const updateData = {
                fullName: 'Updated Name',
                phoneNumber: '0987654321',
                avatarMediaId: null,
            }

            mockSharedUserRepo.updateUser.mockRejectedValue(new Error('Database error'))

            await expect(service.updateProfile(userId, updateData)).rejects.toThrow('Database error')
            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                fullName: updateData.fullName,
                phoneNumber: updateData.phoneNumber,
                avatarMediaId: updateData.avatarMediaId,
            })
        })
    })

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const userId = 1
            const changePasswordData = {
                currentPassword: 'oldPassword123',
                newPassword: 'newPassword123',
                confirmPassword: 'newPassword123',
            }
            const newPasswordHash = 'newHashedPassword'

            mockSharedUserRepo.findUnique.mockResolvedValue(mockUser)
            mockHashingService.compare.mockResolvedValue(true)
            mockHashingService.hash.mockResolvedValue(newPasswordHash)
            mockSharedUserRepo.updateUser.mockResolvedValue({
                ...mockUser,
                passwordHash: newPasswordHash,
            })

            const result = await service.changePassword(userId, changePasswordData)

            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ id: userId })
            expect(hashingService.compare).toHaveBeenCalledWith(
                changePasswordData.currentPassword,
                mockUser.passwordHash,
            )
            expect(hashingService.hash).toHaveBeenCalledWith(changePasswordData.newPassword)
            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                passwordHash: newPasswordHash,
            })
            expect(result).toEqual({ message: 'Đổi mật khẩu thành công' })
        })

        it('should throw error when user does not exist', async () => {
            const userId = 999
            const changePasswordData = {
                currentPassword: 'oldPassword123',
                newPassword: 'newPassword123',
                confirmPassword: 'newPassword123',
            }

            mockSharedUserRepo.findUnique.mockResolvedValue(null)

            await expect(service.changePassword(userId, changePasswordData)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.changePassword(userId, changePasswordData)).rejects.toThrow(
                'Người dùng không tồn tại',
            )
            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ id: userId })
            expect(hashingService.compare).not.toHaveBeenCalled()
            expect(hashingService.hash).not.toHaveBeenCalled()
            expect(sharedUserRepo.updateUser).not.toHaveBeenCalled()
        })

        it('should throw error when current password is incorrect', async () => {
            const userId = 1
            const changePasswordData = {
                currentPassword: 'wrongPassword',
                newPassword: 'newPassword123',
                confirmPassword: 'newPassword123',
            }

            mockSharedUserRepo.findUnique.mockResolvedValue(mockUser)
            mockHashingService.compare.mockResolvedValue(false)

            await expect(service.changePassword(userId, changePasswordData)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.changePassword(userId, changePasswordData)).rejects.toThrow(
                'Mật khẩu hiện tại không đúng',
            )
            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ id: userId })
            expect(hashingService.compare).toHaveBeenCalledWith(
                changePasswordData.currentPassword,
                mockUser.passwordHash,
            )
            expect(hashingService.hash).not.toHaveBeenCalled()
            expect(sharedUserRepo.updateUser).not.toHaveBeenCalled()
        })

        it('should hash new password correctly', async () => {
            const userId = 1
            const changePasswordData = {
                currentPassword: 'oldPassword123',
                newPassword: 'newPassword123',
                confirmPassword: 'newPassword123',
            }
            const newPasswordHash = 'hashedNewPassword'

            mockSharedUserRepo.findUnique.mockResolvedValue(mockUser)
            mockHashingService.compare.mockResolvedValue(true)
            mockHashingService.hash.mockResolvedValue(newPasswordHash)
            mockSharedUserRepo.updateUser.mockResolvedValue({
                ...mockUser,
                passwordHash: newPasswordHash,
            })

            await service.changePassword(userId, changePasswordData)

            expect(hashingService.hash).toHaveBeenCalledWith(changePasswordData.newPassword)
            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                passwordHash: newPasswordHash,
            })
        })

        it('should throw error when database update fails', async () => {
            const userId = 1
            const changePasswordData = {
                currentPassword: 'oldPassword123',
                newPassword: 'newPassword123',
                confirmPassword: 'newPassword123',
            }
            const newPasswordHash = 'newHashedPassword'

            mockSharedUserRepo.findUnique.mockResolvedValue(mockUser)
            mockHashingService.compare.mockResolvedValue(true)
            mockHashingService.hash.mockResolvedValue(newPasswordHash)
            mockSharedUserRepo.updateUser.mockRejectedValue(new Error('Database error'))

            await expect(service.changePassword(userId, changePasswordData)).rejects.toThrow('Database error')
            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ id: userId })
            expect(hashingService.compare).toHaveBeenCalledWith(
                changePasswordData.currentPassword,
                mockUser.passwordHash,
            )
            expect(hashingService.hash).toHaveBeenCalledWith(changePasswordData.newPassword)
            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                passwordHash: newPasswordHash,
            })
        })
    })
})
