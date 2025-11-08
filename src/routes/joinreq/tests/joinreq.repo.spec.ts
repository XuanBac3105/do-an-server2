import { Test, TestingModule } from '@nestjs/testing'
import { JoinreqRepo } from '../repos/joinreq.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import { JoinRequestStatus, Prisma } from '@prisma/client'

describe('JoinreqRepo', () => {
    let repo: JoinreqRepo
    let prismaService: PrismaService

    const mockPrismaService = {
        joinRequest: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        classroom: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JoinreqRepo,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile()

        repo = module.get<JoinreqRepo>(JoinreqRepo)
        prismaService = module.get<PrismaService>(PrismaService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(repo).toBeDefined()
    })

    describe('findById', () => {
        const mockJoinRequest = {
            id: 1,
            studentId: 1,
            classroomId: 1,
            status: JoinRequestStatus.pending,
            requestedAt: new Date(),
            handledAt: null,
        }

        it('should find join request by id', async () => {
            mockPrismaService.joinRequest.findUnique.mockResolvedValue(mockJoinRequest)

            const result = await repo.findById(1)

            expect(prismaService.joinRequest.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            })
            expect(result).toEqual(mockJoinRequest)
        })

        it('should return null if join request not found', async () => {
            mockPrismaService.joinRequest.findUnique.mockResolvedValue(null)

            const result = await repo.findById(999)

            expect(prismaService.joinRequest.findUnique).toHaveBeenCalledWith({
                where: { id: 999 },
            })
            expect(result).toBeNull()
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.joinRequest.findUnique.mockRejectedValue(error)

            await expect(repo.findById(1)).rejects.toThrow(error)
        })
    })

    describe('findUnique', () => {
        const mockJoinRequest = {
            id: 1,
            studentId: 1,
            classroomId: 1,
            status: JoinRequestStatus.pending,
            requestedAt: new Date(),
            handledAt: null,
        }

        it('should find join request by studentId and classroomId', async () => {
            mockPrismaService.joinRequest.findFirst.mockResolvedValue(mockJoinRequest)

            const result = await repo.findUnique({ studentId: 1, classroomId: 1 })

            expect(prismaService.joinRequest.findFirst).toHaveBeenCalledWith({
                where: {
                    studentId: 1,
                    classroomId: 1,
                },
            })
            expect(result).toEqual(mockJoinRequest)
        })

        it('should return null if join request not found', async () => {
            mockPrismaService.joinRequest.findFirst.mockResolvedValue(null)

            const result = await repo.findUnique({ studentId: 999, classroomId: 999 })

            expect(prismaService.joinRequest.findFirst).toHaveBeenCalledWith({
                where: {
                    studentId: 999,
                    classroomId: 999,
                },
            })
            expect(result).toBeNull()
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.joinRequest.findFirst.mockRejectedValue(error)

            await expect(repo.findUnique({ studentId: 1, classroomId: 1 })).rejects.toThrow(error)
        })
    })

    describe('createJoinRequest', () => {
        const mockCreatedRequest = {
            id: 1,
            studentId: 1,
            classroomId: 1,
            status: JoinRequestStatus.pending,
            requestedAt: new Date(),
            handledAt: null,
        }

        it('should create a new join request', async () => {
            mockPrismaService.joinRequest.create.mockResolvedValue(mockCreatedRequest)

            const result = await repo.createJoinRequest(1, 1)

            expect(prismaService.joinRequest.create).toHaveBeenCalledWith({
                data: {
                    studentId: 1,
                    classroomId: 1,
                    status: 'pending',
                    requestedAt: expect.any(Date),
                },
            })
            expect(result).toEqual(mockCreatedRequest)
        })

        it('should create join request with different student and classroom IDs', async () => {
            mockPrismaService.joinRequest.create.mockResolvedValue({
                ...mockCreatedRequest,
                studentId: 2,
                classroomId: 3,
            })

            const result = await repo.createJoinRequest(2, 3)

            expect(prismaService.joinRequest.create).toHaveBeenCalledWith({
                data: {
                    studentId: 2,
                    classroomId: 3,
                    status: 'pending',
                    requestedAt: expect.any(Date),
                },
            })
            expect(result.studentId).toBe(2)
            expect(result.classroomId).toBe(3)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Foreign key constraint failed')
            mockPrismaService.joinRequest.create.mockRejectedValue(error)

            await expect(repo.createJoinRequest(1, 1)).rejects.toThrow(error)
        })
    })

    describe('update', () => {
        const mockUpdatedRequest = {
            id: 1,
            studentId: 1,
            classroomId: 1,
            status: JoinRequestStatus.approved,
            requestedAt: new Date('2024-01-01'),
            handledAt: new Date(),
        }

        it('should update join request status to approved', async () => {
            mockPrismaService.joinRequest.update.mockResolvedValue(mockUpdatedRequest)

            const updateData = {
                id: 1,
                status: JoinRequestStatus.approved,
                handledAt: new Date(),
            }

            const result = await repo.update(updateData)

            expect(prismaService.joinRequest.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
            })
            expect(result).toEqual(mockUpdatedRequest)
        })

        it('should update join request status to rejected', async () => {
            const rejectedRequest = {
                ...mockUpdatedRequest,
                status: JoinRequestStatus.rejected,
            }
            mockPrismaService.joinRequest.update.mockResolvedValue(rejectedRequest)

            const updateData = {
                id: 1,
                status: JoinRequestStatus.rejected,
                handledAt: new Date(),
            }

            const result = await repo.update(updateData)

            expect(prismaService.joinRequest.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
            })
            expect(result.status).toBe(JoinRequestStatus.rejected)
        })

        it('should update join request back to pending (for rejected requests)', async () => {
            const pendingRequest = {
                ...mockUpdatedRequest,
                status: JoinRequestStatus.pending,
                handledAt: null,
            }
            mockPrismaService.joinRequest.update.mockResolvedValue(pendingRequest)

            const updateData = {
                id: 1,
                status: JoinRequestStatus.pending,
                requestedAt: new Date(),
                handledAt: null,
            }

            const result = await repo.update(updateData)

            expect(prismaService.joinRequest.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
            })
            expect(result.status).toBe(JoinRequestStatus.pending)
            expect(result.handledAt).toBeNull()
        })

        it('should propagate database errors', async () => {
            const error = new Error('Record not found')
            mockPrismaService.joinRequest.update.mockRejectedValue(error)

            await expect(repo.update({ id: 999, status: JoinRequestStatus.approved })).rejects.toThrow(error)
        })
    })

    describe('countClassrooms', () => {
        it('should count all classrooms', async () => {
            mockPrismaService.classroom.count.mockResolvedValue(10)

            const result = await repo.countClassrooms({})

            expect(prismaService.classroom.count).toHaveBeenCalledWith({ where: {} })
            expect(result).toBe(10)
        })

        it('should count classrooms with filter', async () => {
            const where: Prisma.ClassroomWhereInput = {
                deletedAt: null,
                isArchived: false,
            }

            mockPrismaService.classroom.count.mockResolvedValue(5)

            const result = await repo.countClassrooms(where)

            expect(prismaService.classroom.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(5)
        })

        it('should count classrooms with search filter', async () => {
            const where: Prisma.ClassroomWhereInput = {
                deletedAt: null,
                OR: [
                    { name: { contains: 'Math', mode: 'insensitive' } },
                    { description: { contains: 'Math', mode: 'insensitive' } },
                ],
            }

            mockPrismaService.classroom.count.mockResolvedValue(2)

            const result = await repo.countClassrooms(where)

            expect(prismaService.classroom.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(2)
        })

        it('should return 0 when no classrooms match', async () => {
            mockPrismaService.classroom.count.mockResolvedValue(0)

            const result = await repo.countClassrooms({ name: 'nonexistent' })

            expect(result).toBe(0)
        })
    })

    describe('findClassrooms', () => {
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
                joinRequests: [],
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
                classroomStudents: [],
                joinRequests: [],
            },
        ]

        it('should find classrooms without student info', async () => {
            mockPrismaService.classroom.findMany.mockResolvedValue(mockClassrooms)

            const where: Prisma.ClassroomWhereInput = { deletedAt: null }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            const result = await repo.findClassrooms(where, orderBy, 0, 10)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                include: undefined,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockClassrooms)
        })

        it('should find classrooms with student info', async () => {
            const classroomsWithStudentInfo = [
                {
                    ...mockClassrooms[0],
                    classroomStudents: [
                        {
                            studentId: 1,
                            classroomId: 1,
                            isActive: true,
                            deletedAt: null,
                        },
                    ],
                    joinRequests: [
                        {
                            id: 1,
                            studentId: 1,
                            classroomId: 1,
                            status: JoinRequestStatus.pending,
                        },
                    ],
                },
            ]

            mockPrismaService.classroom.findMany.mockResolvedValue(classroomsWithStudentInfo)

            const where: Prisma.ClassroomWhereInput = { deletedAt: null }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            const result = await repo.findClassrooms(where, orderBy, 0, 10, {
                includeStudentInfo: true,
                studentId: 1,
            })

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                include: {
                    classroomStudents: {
                        where: {
                            studentId: 1,
                            isActive: true,
                            deletedAt: null,
                        },
                    },
                    joinRequests: {
                        where: {
                            studentId: 1,
                        },
                    },
                },
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(classroomsWithStudentInfo)
        })

        it('should find classrooms with pagination', async () => {
            mockPrismaService.classroom.findMany.mockResolvedValue([mockClassrooms[1]])

            const where: Prisma.ClassroomWhereInput = { deletedAt: null }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            const result = await repo.findClassrooms(where, orderBy, 5, 5)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                include: undefined,
                orderBy,
                skip: 5,
                take: 5,
            })
            expect(result).toHaveLength(1)
        })

        it('should find classrooms with search filter', async () => {
            mockPrismaService.classroom.findMany.mockResolvedValue([mockClassrooms[0]])

            const where: Prisma.ClassroomWhereInput = {
                deletedAt: null,
                OR: [
                    { name: { contains: 'Classroom 1', mode: 'insensitive' } },
                    { description: { contains: 'Classroom 1', mode: 'insensitive' } },
                ],
            }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { name: 'desc' }

            const result = await repo.findClassrooms(where, orderBy, 0, 10)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                include: undefined,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toHaveLength(1)
        })

        it('should return empty array when no classrooms found', async () => {
            mockPrismaService.classroom.findMany.mockResolvedValue([])

            const where: Prisma.ClassroomWhereInput = { name: 'nonexistent' }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            const result = await repo.findClassrooms(where, orderBy, 0, 10)

            expect(result).toEqual([])
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.classroom.findMany.mockRejectedValue(error)

            const where: Prisma.ClassroomWhereInput = { deletedAt: null }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            await expect(repo.findClassrooms(where, orderBy, 0, 10)).rejects.toThrow(error)
        })
    })
})
