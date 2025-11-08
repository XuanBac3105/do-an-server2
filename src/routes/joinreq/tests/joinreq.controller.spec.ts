import { Test, TestingModule } from '@nestjs/testing'
import { JoinreqController } from '../joinreq.controller'
import { IJoinreqService } from '../services/joinreq.interface.service'
import { GetUserParamDto } from 'src/shared/dtos/get-user-param.dto'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { GetJoinreqClassroomsQueryDto, JoinreqClassroomSortByEnum } from '../dtos/queries/get-joinreq-classrooms.dto'
import { EnumOrder } from 'src/shared/constants/enum-order.constant'
import { CreateJoinreqReqDto } from '../dtos/requests/create-joinreq.dto'
import { LeaveClrDto } from '../dtos/requests/leave-classroom.dto'
import { JoinRequestStatus, Role } from '@prisma/client'
import { RoleGuard } from 'src/shared/guards/role.guard'

describe('JoinreqController', () => {
    let controller: JoinreqController
    let joinreqService: IJoinreqService

    const mockJoinreqService = {
        studentViewClassrooms: jest.fn(),
        studentViewJoinedClassrooms: jest.fn(),
        createJoinRequest: jest.fn(),
        leaveClassroom: jest.fn(),
        approveJoinRequest: jest.fn(),
        rejectJoinRequest: jest.fn(),
    }

    const mockRoleGuard = {
        canActivate: jest.fn(() => true),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [JoinreqController],
            providers: [
                {
                    provide: 'IJoinreqService',
                    useValue: mockJoinreqService,
                },
            ],
        })
            .overrideGuard(RoleGuard)
            .useValue(mockRoleGuard)
            .compile()

        controller = module.get<JoinreqController>(JoinreqController)
        joinreqService = module.get<IJoinreqService>('IJoinreqService')
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('getClassrooms', () => {
        const user: GetUserParamDto = {
            id: 1,
            email: 'student@test.com',
            fullName: 'Test Student',
            phoneNumber: '0123456789',
            role: Role.student,
            avatarMediaId: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as GetUserParamDto

        const validQuery: GetJoinreqClassroomsQueryDto = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: JoinreqClassroomSortByEnum.CREATED_AT,
        } as GetJoinreqClassroomsQueryDto

        const expectedResponse = {
            page: 1,
            limit: 10,
            total: 2,
            data: [
                {
                    id: 1,
                    name: 'Classroom 1',
                    description: 'Description 1',
                    coverMediaId: null,
                    isArchived: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isJoined: false,
                    joinRequest: {
                        id: 1,
                        status: JoinRequestStatus.pending,
                        requestedAt: new Date(),
                        handledAt: null,
                    },
                },
                {
                    id: 2,
                    name: 'Classroom 2',
                    description: 'Description 2',
                    coverMediaId: null,
                    isArchived: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isJoined: true,
                    joinRequest: null,
                },
            ],
        }

        it('should get classrooms for student successfully', async () => {
            mockJoinreqService.studentViewClassrooms.mockResolvedValue(expectedResponse)

            const result = await controller.getClassrooms(user, validQuery)

            expect(joinreqService.studentViewClassrooms).toHaveBeenCalledWith(user.id, validQuery)
            expect(joinreqService.studentViewClassrooms).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should get classrooms with search filter', async () => {
            const queryWithSearch = {
                ...validQuery,
                search: 'Math',
            } as GetJoinreqClassroomsQueryDto

            const searchResponse = {
                ...expectedResponse,
                total: 1,
                data: [expectedResponse.data[0]],
            }

            mockJoinreqService.studentViewClassrooms.mockResolvedValue(searchResponse)

            const result = await controller.getClassrooms(user, queryWithSearch)

            expect(joinreqService.studentViewClassrooms).toHaveBeenCalledWith(user.id, queryWithSearch)
            expect(result).toEqual(searchResponse)
        })

        it('should get classrooms sorted by name', async () => {
            const queryWithSort = {
                ...validQuery,
                sortBy: JoinreqClassroomSortByEnum.NAME,
                order: EnumOrder.DESC,
            } as GetJoinreqClassroomsQueryDto

            mockJoinreqService.studentViewClassrooms.mockResolvedValue(expectedResponse)

            const result = await controller.getClassrooms(user, queryWithSort)

            expect(joinreqService.studentViewClassrooms).toHaveBeenCalledWith(user.id, queryWithSort)
            expect(result).toEqual(expectedResponse)
        })

        it('should handle pagination', async () => {
            const queryWithPage = {
                ...validQuery,
                page: 2,
                limit: 5,
            } as GetJoinreqClassroomsQueryDto

            mockJoinreqService.studentViewClassrooms.mockResolvedValue({
                ...expectedResponse,
                page: 2,
                limit: 5,
            })

            const result = await controller.getClassrooms(user, queryWithPage)

            expect(joinreqService.studentViewClassrooms).toHaveBeenCalledWith(user.id, queryWithPage)
            expect(result.page).toBe(2)
            expect(result.limit).toBe(5)
        })

        it('should return empty data when no classrooms available', async () => {
            const emptyResponse = {
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            }

            mockJoinreqService.studentViewClassrooms.mockResolvedValue(emptyResponse)

            const result = await controller.getClassrooms(user, validQuery)

            expect(result).toEqual(emptyResponse)
        })

        it('should handle different user IDs', async () => {
            const differentUser: GetUserParamDto = {
                id: 5,
                email: 'student5@test.com',
                fullName: 'Test Student 5',
                phoneNumber: '0123456789',
                role: Role.student,
                avatarMediaId: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as GetUserParamDto

            mockJoinreqService.studentViewClassrooms.mockResolvedValue(expectedResponse)

            await controller.getClassrooms(differentUser, validQuery)

            expect(joinreqService.studentViewClassrooms).toHaveBeenCalledWith(5, validQuery)
        })
    })

    describe('getJoinedClassrooms', () => {
        const user: GetUserParamDto = {
            id: 1,
            email: 'student@test.com',
            fullName: 'Test Student',
            phoneNumber: '0123456789',
            role: Role.student,
            avatarMediaId: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as GetUserParamDto

        const validQuery: GetJoinreqClassroomsQueryDto = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: JoinreqClassroomSortByEnum.CREATED_AT,
        } as GetJoinreqClassroomsQueryDto

        const expectedResponse = {
            page: 1,
            limit: 10,
            total: 2,
            data: [
                {
                    id: 1,
                    name: 'Classroom 1',
                    description: 'Description 1',
                    coverMediaId: null,
                    isArchived: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    name: 'Classroom 2',
                    description: 'Description 2',
                    coverMediaId: null,
                    isArchived: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        }

        it('should get joined classrooms successfully', async () => {
            mockJoinreqService.studentViewJoinedClassrooms.mockResolvedValue(expectedResponse)

            const result = await controller.getJoinedClassrooms(user, validQuery)

            expect(joinreqService.studentViewJoinedClassrooms).toHaveBeenCalledWith(user.id, validQuery)
            expect(joinreqService.studentViewJoinedClassrooms).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should get joined classrooms with search filter', async () => {
            const queryWithSearch = {
                ...validQuery,
                search: 'Test',
            } as GetJoinreqClassroomsQueryDto

            const searchResponse = {
                ...expectedResponse,
                total: 1,
                data: [expectedResponse.data[0]],
            }

            mockJoinreqService.studentViewJoinedClassrooms.mockResolvedValue(searchResponse)

            const result = await controller.getJoinedClassrooms(user, queryWithSearch)

            expect(joinreqService.studentViewJoinedClassrooms).toHaveBeenCalledWith(user.id, queryWithSearch)
            expect(result).toEqual(searchResponse)
        })

        it('should handle pagination for joined classrooms', async () => {
            const queryWithPage = {
                ...validQuery,
                page: 3,
                limit: 5,
            } as GetJoinreqClassroomsQueryDto

            mockJoinreqService.studentViewJoinedClassrooms.mockResolvedValue({
                ...expectedResponse,
                page: 3,
                limit: 5,
            })

            const result = await controller.getJoinedClassrooms(user, queryWithPage)

            expect(joinreqService.studentViewJoinedClassrooms).toHaveBeenCalledWith(user.id, queryWithPage)
            expect(result.page).toBe(3)
            expect(result.limit).toBe(5)
        })

        it('should return empty data when student has no joined classrooms', async () => {
            const emptyResponse = {
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            }

            mockJoinreqService.studentViewJoinedClassrooms.mockResolvedValue(emptyResponse)

            const result = await controller.getJoinedClassrooms(user, validQuery)

            expect(result).toEqual(emptyResponse)
        })

        it('should get joined classrooms sorted by name', async () => {
            const queryWithSort = {
                ...validQuery,
                sortBy: JoinreqClassroomSortByEnum.NAME,
                order: EnumOrder.DESC,
            } as GetJoinreqClassroomsQueryDto

            mockJoinreqService.studentViewJoinedClassrooms.mockResolvedValue(expectedResponse)

            const result = await controller.getJoinedClassrooms(user, queryWithSort)

            expect(joinreqService.studentViewJoinedClassrooms).toHaveBeenCalledWith(user.id, queryWithSort)
            expect(result).toEqual(expectedResponse)
        })
    })

    describe('createJoinRequest', () => {
        const user: GetUserParamDto = {
            id: 1,
            email: 'student@test.com',
            fullName: 'Test Student',
            phoneNumber: '0123456789',
            role: Role.student,
            avatarMediaId: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as GetUserParamDto

        const createRequestDto: CreateJoinreqReqDto = {
            classroomId: 1,
        } as CreateJoinreqReqDto

        const expectedResponse = {
            id: 1,
            studentId: 1,
            classroomId: 1,
            status: JoinRequestStatus.pending,
            requestedAt: new Date(),
            handledAt: null,
        }

        it('should create join request successfully', async () => {
            mockJoinreqService.createJoinRequest.mockResolvedValue(expectedResponse)

            const result = await controller.createJoinRequest(createRequestDto, user)

            expect(joinreqService.createJoinRequest).toHaveBeenCalledWith(user.id, createRequestDto)
            expect(joinreqService.createJoinRequest).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should create join request for different classroom', async () => {
            const differentClassroomDto: CreateJoinreqReqDto = {
                classroomId: 5,
            } as CreateJoinreqReqDto

            const response = {
                ...expectedResponse,
                classroomId: 5,
            }

            mockJoinreqService.createJoinRequest.mockResolvedValue(response)

            const result = await controller.createJoinRequest(differentClassroomDto, user)

            expect(joinreqService.createJoinRequest).toHaveBeenCalledWith(user.id, differentClassroomDto)
            expect(result.classroomId).toBe(5)
        })

        it('should create join request for different student', async () => {
            const differentUser: GetUserParamDto = {
                id: 10,
                email: 'student10@test.com',
                fullName: 'Test Student 10',
                phoneNumber: '0123456789',
                role: Role.student,
                avatarMediaId: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as GetUserParamDto

            const response = {
                ...expectedResponse,
                studentId: 10,
            }

            mockJoinreqService.createJoinRequest.mockResolvedValue(response)

            const result = await controller.createJoinRequest(createRequestDto, differentUser)

            expect(joinreqService.createJoinRequest).toHaveBeenCalledWith(10, createRequestDto)
            expect(result.studentId).toBe(10)
        })

        it('should propagate service errors', async () => {
            const error = new Error('Yêu cầu tham gia đã tồn tại')
            mockJoinreqService.createJoinRequest.mockRejectedValue(error)

            await expect(controller.createJoinRequest(createRequestDto, user)).rejects.toThrow(error)
        })
    })

    describe('leaveClassroom', () => {
        const user: GetUserParamDto = {
            id: 1,
            email: 'student@test.com',
            fullName: 'Test Student',
            phoneNumber: '0123456789',
            role: Role.student,
            avatarMediaId: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as GetUserParamDto

        const leaveDto: LeaveClrDto = {
            classroomId: 1,
        } as LeaveClrDto

        const expectedResponse = {
            message: 'Rời lớp học thành công',
        }

        it('should leave classroom successfully', async () => {
            mockJoinreqService.leaveClassroom.mockResolvedValue(expectedResponse)

            const result = await controller.leaveClassroom(user, leaveDto)

            expect(joinreqService.leaveClassroom).toHaveBeenCalledWith(user.id, leaveDto.classroomId)
            expect(joinreqService.leaveClassroom).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should leave different classroom', async () => {
            const differentClassroomDto: LeaveClrDto = {
                classroomId: 5,
            } as LeaveClrDto

            mockJoinreqService.leaveClassroom.mockResolvedValue(expectedResponse)

            const result = await controller.leaveClassroom(user, differentClassroomDto)

            expect(joinreqService.leaveClassroom).toHaveBeenCalledWith(user.id, 5)
            expect(result).toEqual(expectedResponse)
        })

        it('should handle different user leaving classroom', async () => {
            const differentUser: GetUserParamDto = {
                id: 3,
                email: 'student3@test.com',
                fullName: 'Test Student 3',
                phoneNumber: '0123456789',
                role: Role.student,
                avatarMediaId: null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as GetUserParamDto

            mockJoinreqService.leaveClassroom.mockResolvedValue(expectedResponse)

            const result = await controller.leaveClassroom(differentUser, leaveDto)

            expect(joinreqService.leaveClassroom).toHaveBeenCalledWith(3, leaveDto.classroomId)
            expect(result).toEqual(expectedResponse)
        })

        it('should propagate service errors', async () => {
            const error = new Error('Classroom not found')
            mockJoinreqService.leaveClassroom.mockRejectedValue(error)

            await expect(controller.leaveClassroom(user, leaveDto)).rejects.toThrow(error)
        })
    })

    describe('approveJoinRequest', () => {
        const params: GetIdParamDto = {
            id: 1,
        } as GetIdParamDto

        const expectedResponse = {
            id: 1,
            studentId: 1,
            classroomId: 1,
            status: JoinRequestStatus.approved,
            requestedAt: new Date(),
            handledAt: new Date(),
        }

        it('should approve join request successfully', async () => {
            mockJoinreqService.approveJoinRequest.mockResolvedValue(expectedResponse)

            const result = await controller.approveJoinRequest(params)

            expect(joinreqService.approveJoinRequest).toHaveBeenCalledWith(params.id)
            expect(joinreqService.approveJoinRequest).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
            expect(result.status).toBe(JoinRequestStatus.approved)
            expect(result.handledAt).toBeDefined()
        })

        it('should approve different join request', async () => {
            const differentParams: GetIdParamDto = {
                id: 10,
            } as GetIdParamDto

            const response = {
                ...expectedResponse,
                id: 10,
            }

            mockJoinreqService.approveJoinRequest.mockResolvedValue(response)

            const result = await controller.approveJoinRequest(differentParams)

            expect(joinreqService.approveJoinRequest).toHaveBeenCalledWith(10)
            expect(result.id).toBe(10)
        })

        it('should propagate service errors when request not found', async () => {
            const error = new Error('Yêu cầu tham gia không tồn tại')
            mockJoinreqService.approveJoinRequest.mockRejectedValue(error)

            await expect(controller.approveJoinRequest(params)).rejects.toThrow(error)
        })

        it('should propagate service errors when already approved', async () => {
            const error = new Error('Yêu cầu tham gia đã được chấp thuận từ trước')
            mockJoinreqService.approveJoinRequest.mockRejectedValue(error)

            await expect(controller.approveJoinRequest(params)).rejects.toThrow(error)
        })
    })

    describe('rejectJoinRequest', () => {
        const params: GetIdParamDto = {
            id: 1,
        } as GetIdParamDto

        const expectedResponse = {
            id: 1,
            studentId: 1,
            classroomId: 1,
            status: JoinRequestStatus.rejected,
            requestedAt: new Date(),
            handledAt: new Date(),
        }

        it('should reject join request successfully', async () => {
            mockJoinreqService.rejectJoinRequest.mockResolvedValue(expectedResponse)

            const result = await controller.rejectJoinRequest(params)

            expect(joinreqService.rejectJoinRequest).toHaveBeenCalledWith(params.id)
            expect(joinreqService.rejectJoinRequest).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
            expect(result.status).toBe(JoinRequestStatus.rejected)
            expect(result.handledAt).toBeDefined()
        })

        it('should reject different join request', async () => {
            const differentParams: GetIdParamDto = {
                id: 15,
            } as GetIdParamDto

            const response = {
                ...expectedResponse,
                id: 15,
            }

            mockJoinreqService.rejectJoinRequest.mockResolvedValue(response)

            const result = await controller.rejectJoinRequest(differentParams)

            expect(joinreqService.rejectJoinRequest).toHaveBeenCalledWith(15)
            expect(result.id).toBe(15)
        })

        it('should propagate service errors when request not found', async () => {
            const error = new Error('Yêu cầu tham gia không tồn tại')
            mockJoinreqService.rejectJoinRequest.mockRejectedValue(error)

            await expect(controller.rejectJoinRequest(params)).rejects.toThrow(error)
        })

        it('should propagate service errors when already rejected', async () => {
            const error = new Error('Yêu cầu tham gia đã bị từ chối trước đó')
            mockJoinreqService.rejectJoinRequest.mockRejectedValue(error)

            await expect(controller.rejectJoinRequest(params)).rejects.toThrow(error)
        })

        it('should propagate service errors when already approved', async () => {
            const error = new Error('Yêu cầu tham gia đã được chấp thuận từ trước. Không thể từ chối')
            mockJoinreqService.rejectJoinRequest.mockRejectedValue(error)

            await expect(controller.rejectJoinRequest(params)).rejects.toThrow(error)
        })
    })
})
