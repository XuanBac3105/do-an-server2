import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from '../user.controller'
import { IUserService } from '../services/user.interface.service'
import { UnprocessableEntityException } from '@nestjs/common'
import { Role } from '@prisma/client'
import { GetUsersQueryDto, UserSortByEnum } from '../dtos/queries/get-users-query.dto'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { EnumOrder } from 'src/shared/constants/enum-order.constant'
import { RoleGuard } from 'src/shared/guards/role.guard'

describe('UserController', () => {
    let controller: UserController
    let userService: IUserService

    const mockUserService = {
        getAllUsers: jest.fn(),
        getUser: jest.fn(),
        deactiveUser: jest.fn(),
        activateUser: jest.fn(),
    }

    const mockRoleGuard = {
        canActivate: jest.fn(() => true),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: 'IUserService',
                    useValue: mockUserService,
                },
            ],
        })
            .overrideGuard(RoleGuard)
            .useValue(mockRoleGuard)
            .compile()

        controller = module.get<UserController>(UserController)
        userService = module.get<IUserService>('IUserService')
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('getAllUsers', () => {
        const validQuery: GetUsersQueryDto = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: UserSortByEnum.CREATED_AT,
        } as GetUsersQueryDto

        const expectedResponse = {
            page: 1,
            limit: 10,
            total: 2,
            data: [
                {
                    id: 1,
                    email: 'user1@example.com',
                    fullName: 'User One',
                    phoneNumber: '0123456789',
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
                    role: Role.admin,
                    isActive: true,
                    avatarMediaId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        }

        it('should get all users successfully', async () => {
            mockUserService.getAllUsers.mockResolvedValue(expectedResponse)

            const result = await controller.getAllUsers(validQuery)

            expect(userService.getAllUsers).toHaveBeenCalledWith(validQuery)
            expect(userService.getAllUsers).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should get users with search filter', async () => {
            const queryWithSearch = {
                ...validQuery,
                search: 'John',
            } as GetUsersQueryDto

            const searchResponse = {
                page: 1,
                limit: 10,
                total: 1,
                data: [
                    {
                        id: 1,
                        email: 'john@example.com',
                        fullName: 'John Doe',
                        phoneNumber: '0123456789',
                        role: Role.student,
                        isActive: true,
                        avatarMediaId: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ],
            }

            mockUserService.getAllUsers.mockResolvedValue(searchResponse)

            const result = await controller.getAllUsers(queryWithSearch)

            expect(userService.getAllUsers).toHaveBeenCalledWith(queryWithSearch)
            expect(result).toEqual(searchResponse)
        })

        it('should get users filtered by isActive status', async () => {
            const queryWithIsActive = {
                ...validQuery,
                isActive: true,
            } as GetUsersQueryDto

            mockUserService.getAllUsers.mockResolvedValue(expectedResponse)

            const result = await controller.getAllUsers(queryWithIsActive)

            expect(userService.getAllUsers).toHaveBeenCalledWith(queryWithIsActive)
            expect(result).toEqual(expectedResponse)
        })

        it('should get users sorted by different fields', async () => {
            const queryWithSortBy = {
                ...validQuery,
                sortBy: UserSortByEnum.FULL_NAME,
                order: EnumOrder.DESC,
            } as GetUsersQueryDto

            mockUserService.getAllUsers.mockResolvedValue(expectedResponse)

            const result = await controller.getAllUsers(queryWithSortBy)

            expect(userService.getAllUsers).toHaveBeenCalledWith(queryWithSortBy)
            expect(result).toEqual(expectedResponse)
        })

        it('should return empty data when no users found', async () => {
            const emptyResponse = {
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            }

            mockUserService.getAllUsers.mockResolvedValue(emptyResponse)

            const result = await controller.getAllUsers(validQuery)

            expect(result).toEqual(emptyResponse)
            expect(result.data).toHaveLength(0)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockUserService.getAllUsers.mockRejectedValue(error)

            await expect(controller.getAllUsers(validQuery)).rejects.toThrow(error)
        })
    })

    describe('getUser', () => {
        const validParam: GetIdParamDto = { id: 1 } as GetIdParamDto

        const expectedUser = {
            id: 1,
            email: 'user@example.com',
            fullName: 'Test User',
            phoneNumber: '0123456789',
            role: Role.student,
            isActive: true,
            avatarMediaId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        it('should get user by id successfully', async () => {
            mockUserService.getUser.mockResolvedValue(expectedUser)

            const result = await controller.getUser(validParam)

            expect(userService.getUser).toHaveBeenCalledWith(validParam.id)
            expect(userService.getUser).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedUser)
        })

        it('should throw error when user not found', async () => {
            const error = new UnprocessableEntityException('ID người dùng không hợp lệ')
            mockUserService.getUser.mockRejectedValue(error)

            await expect(controller.getUser(validParam)).rejects.toThrow(error)
            expect(userService.getUser).toHaveBeenCalledWith(validParam.id)
        })

        it('should get user with different roles', async () => {
            const adminUser = {
                ...expectedUser,
                role: Role.admin,
            }

            mockUserService.getUser.mockResolvedValue(adminUser)

            const result = await controller.getUser(validParam)

            expect(result.role).toBe(Role.admin)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockUserService.getUser.mockRejectedValue(error)

            await expect(controller.getUser(validParam)).rejects.toThrow(error)
        })
    })

    describe('deActiveUser', () => {
        const validParam: GetIdParamDto = { id: 1 } as GetIdParamDto

        const expectedResponse = {
            message: 'Đã vô hiệu hóa người dùng',
        }

        it('should deactivate user successfully', async () => {
            mockUserService.deactiveUser.mockResolvedValue(expectedResponse)

            const result = await controller.deActiveUser(validParam)

            expect(userService.deactiveUser).toHaveBeenCalledWith(validParam.id)
            expect(userService.deactiveUser).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should throw error when user not found', async () => {
            const error = new UnprocessableEntityException('ID người dùng không hợp lệ')
            mockUserService.deactiveUser.mockRejectedValue(error)

            await expect(controller.deActiveUser(validParam)).rejects.toThrow(error)
            expect(userService.deactiveUser).toHaveBeenCalledWith(validParam.id)
        })

        it('should handle multiple deactivation attempts', async () => {
            mockUserService.deactiveUser.mockResolvedValue(expectedResponse)

            await controller.deActiveUser(validParam)
            await controller.deActiveUser(validParam)

            expect(userService.deactiveUser).toHaveBeenCalledTimes(2)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockUserService.deactiveUser.mockRejectedValue(error)

            await expect(controller.deActiveUser(validParam)).rejects.toThrow(error)
        })
    })

    describe('activateUser', () => {
        const validParam: GetIdParamDto = { id: 1 } as GetIdParamDto

        const expectedResponse = {
            message: 'Đã kích hoạt người dùng',
        }

        it('should activate user successfully', async () => {
            mockUserService.activateUser.mockResolvedValue(expectedResponse)

            const result = await controller.activateUser(validParam)

            expect(userService.activateUser).toHaveBeenCalledWith(validParam.id)
            expect(userService.activateUser).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should throw error when user not found', async () => {
            const error = new UnprocessableEntityException('ID người dùng không hợp lệ')
            mockUserService.activateUser.mockRejectedValue(error)

            await expect(controller.activateUser(validParam)).rejects.toThrow(error)
            expect(userService.activateUser).toHaveBeenCalledWith(validParam.id)
        })

        it('should handle multiple activation attempts', async () => {
            mockUserService.activateUser.mockResolvedValue(expectedResponse)

            await controller.activateUser(validParam)
            await controller.activateUser(validParam)

            expect(userService.activateUser).toHaveBeenCalledTimes(2)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockUserService.activateUser.mockRejectedValue(error)

            await expect(controller.activateUser(validParam)).rejects.toThrow(error)
        })
    })
})
