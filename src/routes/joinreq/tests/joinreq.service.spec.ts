import { Test, TestingModule } from '@nestjs/testing'
import { JoinreqService } from '../services/joinreq.service'
import { IJoinreqRepo } from '../repos/joinreq.interface.repo'
import { SharedClassroomRepo } from 'src/shared/repos/shared-classroom.repo'
import { SharedClrStdRepo } from 'src/shared/repos/shared-clrstd.repo'
import { SharedJreqRepo } from 'src/shared/repos/shared-join-req.repo'
import { UnprocessableEntityException } from '@nestjs/common'
import { JoinRequestStatus } from '@prisma/client'
import { GetJoinreqClassroomsQueryType, JoinreqClassroomSortByEnum } from '../dtos/queries/get-joinreq-classrooms.dto'
import { EnumOrder } from 'src/shared/constants/enum-order.constant'

describe('JoinreqService', () => {
    let service: JoinreqService
    let joinreqRepo: IJoinreqRepo
    let sharedClassroomRepo: SharedClassroomRepo
    let sharedClrStdRepo: SharedClrStdRepo
    let sharedJreqRepo: SharedJreqRepo

    const mockJoinreqRepo = {
        findById: jest.fn(),
        findUnique: jest.fn(),
        createJoinRequest: jest.fn(),
        update: jest.fn(),
        countClassrooms: jest.fn(),
        findClassrooms: jest.fn(),
    }

    const mockSharedClassroomRepo = {
        findUnique: jest.fn(),
    }

    const mockSharedClrStdRepo = {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    }

    const mockSharedJreqRepo = {
        deleteJreq: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JoinreqService,
                {
                    provide: 'IJoinreqRepo',
                    useValue: mockJoinreqRepo,
                },
                {
                    provide: SharedClassroomRepo,
                    useValue: mockSharedClassroomRepo,
                },
                {
                    provide: SharedClrStdRepo,
                    useValue: mockSharedClrStdRepo,
                },
                {
                    provide: SharedJreqRepo,
                    useValue: mockSharedJreqRepo,
                },
            ],
        }).compile()

        service = module.get<JoinreqService>(JoinreqService)
        joinreqRepo = module.get<IJoinreqRepo>('IJoinreqRepo')
        sharedClassroomRepo = module.get<SharedClassroomRepo>(SharedClassroomRepo)
        sharedClrStdRepo = module.get<SharedClrStdRepo>(SharedClrStdRepo)
        sharedJreqRepo = module.get<SharedJreqRepo>(SharedJreqRepo)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createJoinRequest', () => {
        const studentId = 1
        const classroomId = 1
        const createRequestBody = { classroomId }

        const mockClassroom = {
            id: classroomId,
            name: 'Test Classroom',
            description: 'Test Description',
            isArchived: false,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const mockJoinRequest = {
            id: 1,
            studentId,
            classroomId,
            status: JoinRequestStatus.pending,
            requestedAt: new Date(),
            handledAt: null,
        }

        it('should create a new join request successfully', async () => {
            mockJoinreqRepo.findUnique.mockResolvedValue(null)
            mockSharedClassroomRepo.findUnique.mockResolvedValue(mockClassroom)
            mockJoinreqRepo.createJoinRequest.mockResolvedValue(mockJoinRequest)

            const result = await service.createJoinRequest(studentId, createRequestBody)

            expect(joinreqRepo.findUnique).toHaveBeenCalledWith({ studentId, classroomId })
            expect(sharedClassroomRepo.findUnique).toHaveBeenCalledWith({ id: classroomId })
            expect(joinreqRepo.createJoinRequest).toHaveBeenCalledWith(studentId, classroomId)
            expect(result).toEqual(mockJoinRequest)
        })

        it('should throw error if request already exists and is pending', async () => {
            const existingRequest = {
                ...mockJoinRequest,
                status: JoinRequestStatus.pending,
            }
            mockJoinreqRepo.findUnique.mockResolvedValue(existingRequest)

            await expect(service.createJoinRequest(studentId, createRequestBody)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.createJoinRequest(studentId, createRequestBody)).rejects.toThrow(
                'Yêu cầu tham gia đã tồn tại',
            )

            expect(joinreqRepo.findUnique).toHaveBeenCalledWith({ studentId, classroomId })
            expect(sharedClassroomRepo.findUnique).not.toHaveBeenCalled()
            expect(joinreqRepo.createJoinRequest).not.toHaveBeenCalled()
        })

        it('should throw error if request already exists and is approved', async () => {
            const existingRequest = {
                ...mockJoinRequest,
                status: JoinRequestStatus.approved,
            }
            mockJoinreqRepo.findUnique.mockResolvedValue(existingRequest)

            await expect(service.createJoinRequest(studentId, createRequestBody)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.createJoinRequest(studentId, createRequestBody)).rejects.toThrow(
                'Yêu cầu tham gia đã tồn tại',
            )
        })

        it('should update request if it was previously rejected', async () => {
            const rejectedRequest = {
                ...mockJoinRequest,
                status: JoinRequestStatus.rejected,
                handledAt: new Date('2024-01-01'),
            }
            const updatedRequest = {
                ...rejectedRequest,
                status: JoinRequestStatus.pending,
                requestedAt: new Date(),
                handledAt: null,
            }

            mockJoinreqRepo.findUnique.mockResolvedValue(rejectedRequest)
            mockJoinreqRepo.update.mockResolvedValue(updatedRequest)

            const result = await service.createJoinRequest(studentId, createRequestBody)

            expect(joinreqRepo.findUnique).toHaveBeenCalledWith({ studentId, classroomId })
            expect(joinreqRepo.update).toHaveBeenCalledWith({
                id: rejectedRequest.id,
                status: JoinRequestStatus.pending,
                requestedAt: expect.any(Date),
                handledAt: null,
            })
            expect(result.status).toBe(JoinRequestStatus.pending)
            expect(result.handledAt).toBeNull()
        })

        it('should throw error if classroom does not exist', async () => {
            mockJoinreqRepo.findUnique.mockResolvedValue(null)
            mockSharedClassroomRepo.findUnique.mockResolvedValue(null)

            await expect(service.createJoinRequest(studentId, createRequestBody)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.createJoinRequest(studentId, createRequestBody)).rejects.toThrow(
                'Lớp học không tồn tại',
            )

            expect(joinreqRepo.createJoinRequest).not.toHaveBeenCalled()
        })

        it('should throw error if classroom is deleted', async () => {
            const deletedClassroom = {
                ...mockClassroom,
                deletedAt: new Date(),
            }

            mockJoinreqRepo.findUnique.mockResolvedValue(null)
            mockSharedClassroomRepo.findUnique.mockResolvedValue(deletedClassroom)

            await expect(service.createJoinRequest(studentId, createRequestBody)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.createJoinRequest(studentId, createRequestBody)).rejects.toThrow(
                'Lớp học không tồn tại',
            )
        })

        it('should throw error if classroom is archived', async () => {
            const archivedClassroom = {
                ...mockClassroom,
                isArchived: true,
            }

            mockJoinreqRepo.findUnique.mockResolvedValue(null)
            mockSharedClassroomRepo.findUnique.mockResolvedValue(archivedClassroom)

            await expect(service.createJoinRequest(studentId, createRequestBody)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.createJoinRequest(studentId, createRequestBody)).rejects.toThrow(
                'Không thể tham gia lớp học đã lưu trữ',
            )
        })
    })

    describe('approveJoinRequest', () => {
        const joinRequestId = 1
        const mockJoinRequest = {
            id: joinRequestId,
            studentId: 1,
            classroomId: 1,
            status: JoinRequestStatus.pending,
            requestedAt: new Date(),
            handledAt: null,
        }

        const mockUpdatedRequest = {
            ...mockJoinRequest,
            status: JoinRequestStatus.approved,
            handledAt: new Date(),
        }

        it('should approve join request successfully and create new classroom student', async () => {
            mockJoinreqRepo.findById.mockResolvedValue(mockJoinRequest)
            mockJoinreqRepo.update.mockResolvedValue(mockUpdatedRequest)
            mockSharedClrStdRepo.findUnique.mockResolvedValue(null)
            mockSharedClrStdRepo.create.mockResolvedValue({})

            const result = await service.approveJoinRequest(joinRequestId)

            expect(joinreqRepo.findById).toHaveBeenCalledWith(joinRequestId)
            expect(joinreqRepo.update).toHaveBeenCalledWith({
                id: mockJoinRequest.id,
                status: JoinRequestStatus.approved,
                handledAt: expect.any(Date),
            })
            expect(sharedClrStdRepo.findUnique).toHaveBeenCalledWith({
                classroomId: mockJoinRequest.classroomId,
                studentId: mockJoinRequest.studentId,
            })
            expect(sharedClrStdRepo.create).toHaveBeenCalledWith({
                classroomId: mockJoinRequest.classroomId,
                studentId: mockJoinRequest.studentId,
            })
            expect(result).toEqual(mockUpdatedRequest)
        })

        it('should approve join request and restore deleted classroom student', async () => {
            const deletedClrStd = {
                studentId: 1,
                classroomId: 1,
                isActive: true,
                deletedAt: new Date('2024-01-01'),
            }

            mockJoinreqRepo.findById.mockResolvedValue(mockJoinRequest)
            mockJoinreqRepo.update.mockResolvedValue(mockUpdatedRequest)
            mockSharedClrStdRepo.findUnique.mockResolvedValue(deletedClrStd)
            mockSharedClrStdRepo.update.mockResolvedValue({})

            const result = await service.approveJoinRequest(joinRequestId)

            expect(sharedClrStdRepo.update).toHaveBeenCalledWith({
                classroomId: mockJoinRequest.classroomId,
                studentId: mockJoinRequest.studentId,
                deletedAt: null,
            })
            expect(sharedClrStdRepo.create).not.toHaveBeenCalled()
            expect(result).toEqual(mockUpdatedRequest)
        })

        it('should not update but create new record if deletedAt is null', async () => {
            const activeClrStd = {
                studentId: 1,
                classroomId: 1,
                isActive: true,
                deletedAt: null,
            }

            mockJoinreqRepo.findById.mockResolvedValue(mockJoinRequest)
            mockJoinreqRepo.update.mockResolvedValue(mockUpdatedRequest)
            mockSharedClrStdRepo.findUnique.mockResolvedValue(activeClrStd)
            mockSharedClrStdRepo.create.mockResolvedValue({})

            const result = await service.approveJoinRequest(joinRequestId)

            expect(sharedClrStdRepo.update).not.toHaveBeenCalled()
            expect(sharedClrStdRepo.create).toHaveBeenCalledWith({
                classroomId: mockJoinRequest.classroomId,
                studentId: mockJoinRequest.studentId,
            })
            expect(result).toEqual(mockUpdatedRequest)
        })

        it('should throw error if join request not found', async () => {
            mockJoinreqRepo.findById.mockResolvedValue(null)

            await expect(service.approveJoinRequest(joinRequestId)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.approveJoinRequest(joinRequestId)).rejects.toThrow(
                'Yêu cầu tham gia không tồn tại',
            )

            expect(joinreqRepo.update).not.toHaveBeenCalled()
        })

        it('should throw error if join request is already approved', async () => {
            const approvedRequest = {
                ...mockJoinRequest,
                status: JoinRequestStatus.approved,
            }

            mockJoinreqRepo.findById.mockResolvedValue(approvedRequest)

            await expect(service.approveJoinRequest(joinRequestId)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.approveJoinRequest(joinRequestId)).rejects.toThrow(
                'Yêu cầu tham gia đã được chấp thuận từ trước',
            )

            expect(joinreqRepo.update).not.toHaveBeenCalled()
        })

        it('should be able to approve a rejected request', async () => {
            const rejectedRequest = {
                ...mockJoinRequest,
                status: JoinRequestStatus.rejected,
                handledAt: new Date('2024-01-01'),
            }

            mockJoinreqRepo.findById.mockResolvedValue(rejectedRequest)
            mockJoinreqRepo.update.mockResolvedValue(mockUpdatedRequest)
            mockSharedClrStdRepo.findUnique.mockResolvedValue(null)
            mockSharedClrStdRepo.create.mockResolvedValue({})

            const result = await service.approveJoinRequest(joinRequestId)

            expect(joinreqRepo.update).toHaveBeenCalled()
            expect(result.status).toBe(JoinRequestStatus.approved)
        })
    })

    describe('rejectJoinRequest', () => {
        const joinRequestId = 1
        const mockJoinRequest = {
            id: joinRequestId,
            studentId: 1,
            classroomId: 1,
            status: JoinRequestStatus.pending,
            requestedAt: new Date(),
            handledAt: null,
        }

        const mockRejectedRequest = {
            ...mockJoinRequest,
            status: JoinRequestStatus.rejected,
            handledAt: new Date(),
        }

        it('should reject join request successfully', async () => {
            mockJoinreqRepo.findById.mockResolvedValue(mockJoinRequest)
            mockJoinreqRepo.update.mockResolvedValue(mockRejectedRequest)

            const result = await service.rejectJoinRequest(joinRequestId)

            expect(joinreqRepo.findById).toHaveBeenCalledWith(joinRequestId)
            expect(joinreqRepo.update).toHaveBeenCalledWith({
                id: mockJoinRequest.id,
                status: JoinRequestStatus.rejected,
                handledAt: expect.any(Date),
            })
            expect(result).toEqual(mockRejectedRequest)
        })

        it('should throw error if join request not found', async () => {
            mockJoinreqRepo.findById.mockResolvedValue(null)

            await expect(service.rejectJoinRequest(joinRequestId)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.rejectJoinRequest(joinRequestId)).rejects.toThrow(
                'Yêu cầu tham gia không tồn tại',
            )

            expect(joinreqRepo.update).not.toHaveBeenCalled()
        })

        it('should throw error if join request is already rejected', async () => {
            const rejectedRequest = {
                ...mockJoinRequest,
                status: JoinRequestStatus.rejected,
            }

            mockJoinreqRepo.findById.mockResolvedValue(rejectedRequest)

            await expect(service.rejectJoinRequest(joinRequestId)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.rejectJoinRequest(joinRequestId)).rejects.toThrow(
                'Yêu cầu tham gia đã bị từ chối trước đó',
            )

            expect(joinreqRepo.update).not.toHaveBeenCalled()
        })

        it('should throw error if join request is already approved', async () => {
            const approvedRequest = {
                ...mockJoinRequest,
                status: JoinRequestStatus.approved,
            }

            mockJoinreqRepo.findById.mockResolvedValue(approvedRequest)

            await expect(service.rejectJoinRequest(joinRequestId)).rejects.toThrow(
                UnprocessableEntityException,
            )
            await expect(service.rejectJoinRequest(joinRequestId)).rejects.toThrow(
                'Yêu cầu tham gia đã được chấp thuận từ trước. Không thể từ chối',
            )

            expect(joinreqRepo.update).not.toHaveBeenCalled()
        })
    })

    describe('studentViewClassrooms', () => {
        const studentId = 1
        const query: GetJoinreqClassroomsQueryType = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: JoinreqClassroomSortByEnum.CREATED_AT,
        }

        const mockClassrooms = [
            {
                id: 1,
                name: 'Classroom 1',
                description: 'Description 1',
                coverMediaId: null,
                isArchived: false,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
                deletedAt: null,
                classroomStudents: [],
                joinRequests: [
                    {
                        id: 1,
                        status: JoinRequestStatus.pending,
                        requestedAt: new Date('2024-01-01'),
                        handledAt: null,
                    },
                ],
            },
            {
                id: 2,
                name: 'Classroom 2',
                description: 'Description 2',
                coverMediaId: null,
                isArchived: false,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
                deletedAt: null,
                classroomStudents: [
                    {
                        studentId: 1,
                        classroomId: 2,
                        isActive: true,
                        deletedAt: null,
                    },
                ],
                joinRequests: [],
            },
        ]

        it('should get classrooms with join request status', async () => {
            mockJoinreqRepo.countClassrooms.mockResolvedValue(2)
            mockJoinreqRepo.findClassrooms.mockResolvedValue(mockClassrooms)

            const result = await service.studentViewClassrooms(studentId, query)

            expect(joinreqRepo.countClassrooms).toHaveBeenCalledWith({
                deletedAt: null,
            })
            expect(joinreqRepo.findClassrooms).toHaveBeenCalledWith(
                { deletedAt: null },
                { createdAt: 'asc' },
                0,
                10,
                {
                    includeStudentInfo: true,
                    studentId,
                },
            )
            expect(result).toEqual({
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
                        createdAt: mockClassrooms[0].createdAt,
                        updatedAt: mockClassrooms[0].updatedAt,
                        isJoined: false,
                        joinRequest: {
                            id: 1,
                            status: JoinRequestStatus.pending,
                            requestedAt: mockClassrooms[0].joinRequests[0].requestedAt,
                            handledAt: null,
                        },
                    },
                    {
                        id: 2,
                        name: 'Classroom 2',
                        description: 'Description 2',
                        coverMediaId: null,
                        isArchived: false,
                        createdAt: mockClassrooms[1].createdAt,
                        updatedAt: mockClassrooms[1].updatedAt,
                        isJoined: true,
                        joinRequest: null,
                    },
                ],
            })
        })

        it('should filter classrooms by search term', async () => {
            const searchQuery = {
                ...query,
                search: 'Math',
            }

            mockJoinreqRepo.countClassrooms.mockResolvedValue(1)
            mockJoinreqRepo.findClassrooms.mockResolvedValue([mockClassrooms[0]])

            await service.studentViewClassrooms(studentId, searchQuery)

            expect(joinreqRepo.countClassrooms).toHaveBeenCalledWith({
                deletedAt: null,
                OR: [
                    { name: { contains: 'Math', mode: 'insensitive' } },
                    { description: { contains: 'Math', mode: 'insensitive' } },
                ],
            })
        })

        it('should handle pagination correctly', async () => {
            const pageQuery = {
                ...query,
                page: 2,
                limit: 5,
            }

            mockJoinreqRepo.countClassrooms.mockResolvedValue(10)
            mockJoinreqRepo.findClassrooms.mockResolvedValue([])

            await service.studentViewClassrooms(studentId, pageQuery)

            expect(joinreqRepo.findClassrooms).toHaveBeenCalledWith(
                { deletedAt: null },
                { createdAt: 'asc' },
                5, // skip = (page - 1) * limit
                5, // take = limit
                {
                    includeStudentInfo: true,
                    studentId,
                },
            )
        })

        it('should handle different sorting options', async () => {
            const sortQuery: GetJoinreqClassroomsQueryType = {
                ...query,
                sortBy: JoinreqClassroomSortByEnum.NAME,
                order: EnumOrder.DESC,
            }

            mockJoinreqRepo.countClassrooms.mockResolvedValue(2)
            mockJoinreqRepo.findClassrooms.mockResolvedValue(mockClassrooms)

            await service.studentViewClassrooms(studentId, sortQuery)

            expect(joinreqRepo.findClassrooms).toHaveBeenCalledWith(
                { deletedAt: null },
                { name: 'desc' },
                0,
                10,
                {
                    includeStudentInfo: true,
                    studentId,
                },
            )
        })

        it('should return empty data when no classrooms found', async () => {
            mockJoinreqRepo.countClassrooms.mockResolvedValue(0)
            mockJoinreqRepo.findClassrooms.mockResolvedValue([])

            const result = await service.studentViewClassrooms(studentId, query)

            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            })
        })
    })

    describe('studentViewJoinedClassrooms', () => {
        const studentId = 1
        const query: GetJoinreqClassroomsQueryType = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: JoinreqClassroomSortByEnum.CREATED_AT,
        }

        const mockJoinedClassrooms = [
            {
                id: 1,
                name: 'Classroom 1',
                description: 'Description 1',
                coverMediaId: null,
                isArchived: false,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            },
            {
                id: 2,
                name: 'Classroom 2',
                description: 'Description 2',
                coverMediaId: null,
                isArchived: false,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
            },
        ]

        const mockJoinedClassroomsFromRepo = [
            {
                ...mockJoinedClassrooms[0],
                deletedAt: null,
            },
            {
                ...mockJoinedClassrooms[1],
                deletedAt: null,
            },
        ]

        it('should get joined classrooms successfully', async () => {
            mockJoinreqRepo.countClassrooms.mockResolvedValue(2)
            mockJoinreqRepo.findClassrooms.mockResolvedValue(mockJoinedClassroomsFromRepo)

            const result = await service.studentViewJoinedClassrooms(studentId, query)

            expect(joinreqRepo.countClassrooms).toHaveBeenCalledWith({
                deletedAt: null,
                classroomStudents: {
                    some: {
                        studentId,
                        isActive: true,
                        deletedAt: null,
                    },
                },
            })
            expect(joinreqRepo.findClassrooms).toHaveBeenCalledWith(
                {
                    deletedAt: null,
                    classroomStudents: {
                        some: {
                            studentId,
                            isActive: true,
                            deletedAt: null,
                        },
                    },
                },
                { createdAt: 'asc' },
                0,
                10,
            )
            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 2,
                data: mockJoinedClassrooms,
            })
        })

        it('should filter joined classrooms by search term', async () => {
            const searchQuery = {
                ...query,
                search: 'Test',
            }

            mockJoinreqRepo.countClassrooms.mockResolvedValue(1)
            mockJoinreqRepo.findClassrooms.mockResolvedValue([mockJoinedClassroomsFromRepo[0]])

            await service.studentViewJoinedClassrooms(studentId, searchQuery)

            expect(joinreqRepo.countClassrooms).toHaveBeenCalledWith({
                deletedAt: null,
                classroomStudents: {
                    some: {
                        studentId,
                        isActive: true,
                        deletedAt: null,
                    },
                },
                OR: [
                    { name: { contains: 'Test', mode: 'insensitive' } },
                    { description: { contains: 'Test', mode: 'insensitive' } },
                ],
            })
        })

        it('should handle pagination for joined classrooms', async () => {
            const pageQuery = {
                ...query,
                page: 3,
                limit: 5,
            }

            mockJoinreqRepo.countClassrooms.mockResolvedValue(15)
            mockJoinreqRepo.findClassrooms.mockResolvedValue([])

            await service.studentViewJoinedClassrooms(studentId, pageQuery)

            expect(joinreqRepo.findClassrooms).toHaveBeenCalledWith(
                expect.any(Object),
                { createdAt: 'asc' },
                10, // skip = (3 - 1) * 5
                5,
            )
        })

        it('should handle different sorting for joined classrooms', async () => {
            const sortQuery: GetJoinreqClassroomsQueryType = {
                ...query,
                sortBy: JoinreqClassroomSortByEnum.NAME,
                order: EnumOrder.DESC,
            }

            mockJoinreqRepo.countClassrooms.mockResolvedValue(2)
            mockJoinreqRepo.findClassrooms.mockResolvedValue(mockJoinedClassroomsFromRepo)

            await service.studentViewJoinedClassrooms(studentId, sortQuery)

            expect(joinreqRepo.findClassrooms).toHaveBeenCalledWith(
                expect.any(Object),
                { name: 'desc' },
                0,
                10,
            )
        })

        it('should return empty data when student has no joined classrooms', async () => {
            mockJoinreqRepo.countClassrooms.mockResolvedValue(0)
            mockJoinreqRepo.findClassrooms.mockResolvedValue([])

            const result = await service.studentViewJoinedClassrooms(studentId, query)

            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            })
        })
    })

    describe('leaveClassroom', () => {
        const studentId = 1
        const classroomId = 1

        it('should leave classroom successfully', async () => {
            mockSharedClrStdRepo.update.mockResolvedValue({})
            mockSharedJreqRepo.deleteJreq.mockResolvedValue({})

            const result = await service.leaveClassroom(studentId, classroomId)

            expect(sharedClrStdRepo.update).toHaveBeenCalledWith({
                studentId,
                classroomId,
                deletedAt: expect.any(Date),
            })
            expect(sharedJreqRepo.deleteJreq).toHaveBeenCalledWith(classroomId, studentId)
            expect(result).toEqual({ message: 'Rời lớp học thành công' })
        })

        it('should handle different student and classroom IDs', async () => {
            mockSharedClrStdRepo.update.mockResolvedValue({})
            mockSharedJreqRepo.deleteJreq.mockResolvedValue({})

            const result = await service.leaveClassroom(5, 10)

            expect(sharedClrStdRepo.update).toHaveBeenCalledWith({
                studentId: 5,
                classroomId: 10,
                deletedAt: expect.any(Date),
            })
            expect(sharedJreqRepo.deleteJreq).toHaveBeenCalledWith(10, 5)
            expect(result).toEqual({ message: 'Rời lớp học thành công' })
        })

        it('should propagate errors from sharedClrStdRepo', async () => {
            const error = new Error('Update failed')
            mockSharedClrStdRepo.update.mockRejectedValue(error)

            await expect(service.leaveClassroom(studentId, classroomId)).rejects.toThrow(error)
        })

        it('should propagate errors from sharedJreqRepo', async () => {
            const error = new Error('Delete failed')
            mockSharedClrStdRepo.update.mockResolvedValue({})
            mockSharedJreqRepo.deleteJreq.mockRejectedValue(error)

            await expect(service.leaveClassroom(studentId, classroomId)).rejects.toThrow(error)
        })
    })
})
