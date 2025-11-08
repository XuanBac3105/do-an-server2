import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../services/user.service'
import { IUserRepo } from '../repos/user.interface.repo'
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo'
import { UnprocessableEntityException } from '@nestjs/common'
import { Role } from '@prisma/client'
import { GetUsersQueryType, UserSortByEnum } from '../dtos/queries/get-users-query.dto'
import { EnumOrder } from 'src/shared/constants/enum-order.constant'

describe('UserService', () => {
    let service: UserService
    let userRepo: IUserRepo
    let sharedUserRepo: SharedUserRepo

    const mockUserRepo = {
        count: jest.fn(),
        findMany: jest.fn(),
    }

    const mockSharedUserRepo = {
        findUnique: jest.fn(),
        updateUser: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: 'IUserRepo',
                    useValue: mockUserRepo,
                },
                {
                    provide: SharedUserRepo,
                    useValue: mockSharedUserRepo,
                },
            ],
        }).compile()

        service = module.get<UserService>(UserService)
        userRepo = module.get<IUserRepo>('IUserRepo')
        sharedUserRepo = module.get<SharedUserRepo>(SharedUserRepo)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('getAllUsers', () => {
        const query: GetUsersQueryType = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: UserSortByEnum.CREATED_AT,
        }

        const mockUsers = [
            {
                id: 1,
                email: 'user1@example.com',
                fullName: 'User One',
                phoneNumber: '0123456789',
                passwordHash: 'hashed_password',
                role: Role.student,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                email: 'user2@example.com',
                fullName: 'User Two',
                phoneNumber: '0987654321',
                passwordHash: 'hashed_password',
                role: Role.admin,
                isActive: true,
                avatarMediaId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]

        it('should get all users with pagination', async () => {
            mockUserRepo.count.mockResolvedValue(2)
            mockUserRepo.findMany.mockResolvedValue(mockUsers)

            const result = await service.getAllUsers(query)

            expect(userRepo.count).toHaveBeenCalledWith({})
            expect(userRepo.findMany).toHaveBeenCalledWith(
                {},
                { createdAt: 'asc' },
                0,
                10,
            )
            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 2,
                data: mockUsers,
            })
        })

        it('should filter users by isActive status', async () => {
            const queryWithFilter = {
                ...query,
                isActive: true,
            }

            mockUserRepo.count.mockResolvedValue(2)
            mockUserRepo.findMany.mockResolvedValue(mockUsers)

            await service.getAllUsers(queryWithFilter)

            expect(userRepo.count).toHaveBeenCalledWith({
                isActive: true,
            })
            expect(userRepo.findMany).toHaveBeenCalledWith(
                { isActive: true },
                { createdAt: 'asc' },
                0,
                10,
            )
        })

        it('should search users by fullName, email, or phoneNumber', async () => {
            const queryWithSearch = {
                ...query,
                search: 'John',
            }

            const expectedWhereClause = {
                OR: [
                    { fullName: { contains: 'John', mode: 'insensitive' } },
                    { email: { contains: 'John', mode: 'insensitive' } },
                    { phoneNumber: { contains: 'John', mode: 'insensitive' } },
                ],
            }

            mockUserRepo.count.mockResolvedValue(1)
            mockUserRepo.findMany.mockResolvedValue([mockUsers[0]])

            await service.getAllUsers(queryWithSearch)

            expect(userRepo.count).toHaveBeenCalledWith(expectedWhereClause)
            expect(userRepo.findMany).toHaveBeenCalledWith(
                expectedWhereClause,
                { createdAt: 'asc' },
                0,
                10,
            )
        })

        it('should sort users by fullName', async () => {
            const queryWithSort = {
                ...query,
                sortBy: UserSortByEnum.FULL_NAME,
                order: EnumOrder.DESC,
            }

            mockUserRepo.count.mockResolvedValue(2)
            mockUserRepo.findMany.mockResolvedValue(mockUsers)

            await service.getAllUsers(queryWithSort)

            expect(userRepo.findMany).toHaveBeenCalledWith(
                {},
                { fullName: 'desc' },
                0,
                10,
            )
        })

        it('should sort users by email', async () => {
            const queryWithSort = {
                ...query,
                sortBy: UserSortByEnum.EMAIL,
            }

            mockUserRepo.count.mockResolvedValue(2)
            mockUserRepo.findMany.mockResolvedValue(mockUsers)

            await service.getAllUsers(queryWithSort)

            expect(userRepo.findMany).toHaveBeenCalledWith(
                {},
                { email: 'asc' },
                0,
                10,
            )
        })

        it('should sort users by phoneNumber', async () => {
            const queryWithSort = {
                ...query,
                sortBy: UserSortByEnum.PHONE_NUMBER,
            }

            mockUserRepo.count.mockResolvedValue(2)
            mockUserRepo.findMany.mockResolvedValue(mockUsers)

            await service.getAllUsers(queryWithSort)

            expect(userRepo.findMany).toHaveBeenCalledWith(
                {},
                { phoneNumber: 'asc' },
                0,
                10,
            )
        })

        it('should handle pagination correctly', async () => {
            const queryPage2 = {
                ...query,
                page: 2,
                limit: 5,
            }

            mockUserRepo.count.mockResolvedValue(10)
            mockUserRepo.findMany.mockResolvedValue(mockUsers)

            await service.getAllUsers(queryPage2)

            expect(userRepo.findMany).toHaveBeenCalledWith(
                {},
                { createdAt: 'asc' },
                5, // skip = (page - 1) * limit = (2 - 1) * 5
                5, // take = limit
            )
        })

        it('should combine filters, search, and sorting', async () => {
            const complexQuery = {
                ...query,
                isActive: false,
                search: 'test',
                sortBy: UserSortByEnum.FULL_NAME,
                order: EnumOrder.DESC,
            }

            const expectedWhereClause = {
                isActive: false,
                OR: [
                    { fullName: { contains: 'test', mode: 'insensitive' } },
                    { email: { contains: 'test', mode: 'insensitive' } },
                    { phoneNumber: { contains: 'test', mode: 'insensitive' } },
                ],
            }

            mockUserRepo.count.mockResolvedValue(1)
            mockUserRepo.findMany.mockResolvedValue([mockUsers[0]])

            await service.getAllUsers(complexQuery)

            expect(userRepo.count).toHaveBeenCalledWith(expectedWhereClause)
            expect(userRepo.findMany).toHaveBeenCalledWith(
                expectedWhereClause,
                { fullName: 'desc' },
                0,
                10,
            )
        })

        it('should return empty list when no users found', async () => {
            mockUserRepo.count.mockResolvedValue(0)
            mockUserRepo.findMany.mockResolvedValue([])

            const result = await service.getAllUsers(query)

            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            })
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Database error')
            mockUserRepo.count.mockRejectedValue(error)

            await expect(service.getAllUsers(query)).rejects.toThrow(error)
        })
    })

    describe('getUser', () => {
        const userId = 1

        const mockUser = {
            id: 1,
            email: 'user@example.com',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            passwordHash: 'hashed_password',
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should get user by id successfully', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(mockUser)

            const result = await service.getUser(userId)

            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ id: userId })
            expect(result).toEqual(mockUser)
        })

        it('should throw error when user not found', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(null)

            await expect(service.getUser(userId)).rejects.toThrow(
                new UnprocessableEntityException('ID người dùng không hợp lệ'),
            )
            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ id: userId })
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Database error')
            mockSharedUserRepo.findUnique.mockRejectedValue(error)

            await expect(service.getUser(userId)).rejects.toThrow(error)
        })
    })

    describe('deactiveUser', () => {
        const userId = 1

        const mockUser = {
            id: 1,
            email: 'user@example.com',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            passwordHash: 'hashed_password',
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should deactivate user successfully', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(mockUser)
            mockSharedUserRepo.updateUser.mockResolvedValue({
                ...mockUser,
                isActive: false,
            })

            const result = await service.deactiveUser(userId)

            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ id: userId })
            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                isActive: false,
            })
            expect(result).toEqual({ message: 'Đã vô hiệu hóa người dùng' })
        })

        it('should throw error when user not found', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(null)

            await expect(service.deactiveUser(userId)).rejects.toThrow(
                new UnprocessableEntityException('ID người dùng không hợp lệ'),
            )
            expect(sharedUserRepo.updateUser).not.toHaveBeenCalled()
        })

        it('should deactivate already inactive user', async () => {
            const inactiveUser = {
                ...mockUser,
                isActive: false,
            }

            mockSharedUserRepo.findUnique.mockResolvedValue(inactiveUser)
            mockSharedUserRepo.updateUser.mockResolvedValue(inactiveUser)

            const result = await service.deactiveUser(userId)

            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                isActive: false,
            })
            expect(result).toEqual({ message: 'Đã vô hiệu hóa người dùng' })
        })

        it('should propagate errors from repository', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(mockUser)

            const error = new Error('Database error')
            mockSharedUserRepo.updateUser.mockRejectedValue(error)

            await expect(service.deactiveUser(userId)).rejects.toThrow(error)
        })
    })

    describe('activateUser', () => {
        const userId = 1

        const mockUser = {
            id: 1,
            email: 'user@example.com',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            passwordHash: 'hashed_password',
            role: Role.student,
            isActive: false,
            avatarMediaId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should activate user successfully', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(mockUser)
            mockSharedUserRepo.updateUser.mockResolvedValue({
                ...mockUser,
                isActive: true,
            })

            const result = await service.activateUser(userId)

            expect(sharedUserRepo.findUnique).toHaveBeenCalledWith({ id: userId })
            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                isActive: true,
            })
            expect(result).toEqual({ message: 'Đã kích hoạt người dùng' })
        })

        it('should throw error when user not found', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(null)

            await expect(service.activateUser(userId)).rejects.toThrow(
                new UnprocessableEntityException('ID người dùng không hợp lệ'),
            )
            expect(sharedUserRepo.updateUser).not.toHaveBeenCalled()
        })

        it('should activate already active user', async () => {
            const activeUser = {
                ...mockUser,
                isActive: true,
            }

            mockSharedUserRepo.findUnique.mockResolvedValue(activeUser)
            mockSharedUserRepo.updateUser.mockResolvedValue(activeUser)

            const result = await service.activateUser(userId)

            expect(sharedUserRepo.updateUser).toHaveBeenCalledWith({
                id: userId,
                isActive: true,
            })
            expect(result).toEqual({ message: 'Đã kích hoạt người dùng' })
        })

        it('should propagate errors from repository', async () => {
            mockSharedUserRepo.findUnique.mockResolvedValue(mockUser)

            const error = new Error('Database error')
            mockSharedUserRepo.updateUser.mockRejectedValue(error)

            await expect(service.activateUser(userId)).rejects.toThrow(error)
        })
    })
})
