import { Test, TestingModule } from '@nestjs/testing'
import { ClassroomRepo } from '../repos/classroom.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import { Prisma } from '@prisma/client'

describe('ClassroomRepo', () => {
    let repo: ClassroomRepo
    let prismaService: PrismaService

    const mockPrismaService = {
        classroom: {
            count: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClassroomRepo,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile()

        repo = module.get<ClassroomRepo>(ClassroomRepo)
        prismaService = module.get<PrismaService>(PrismaService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(repo).toBeDefined()
    })

    describe('count', () => {
        it('should count all classrooms', async () => {
            mockPrismaService.classroom.count.mockResolvedValue(5)

            const result = await repo.count({})

            expect(prismaService.classroom.count).toHaveBeenCalledWith({ where: {} })
            expect(result).toBe(5)
        })

        it('should count classrooms with filter', async () => {
            const where: Prisma.ClassroomWhereInput = {
                isArchived: false,
            }

            mockPrismaService.classroom.count.mockResolvedValue(3)

            const result = await repo.count(where)

            expect(prismaService.classroom.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(3)
        })

        it('should count classrooms with deletedAt filter', async () => {
            const where: Prisma.ClassroomWhereInput = {
                deletedAt: null,
            }

            mockPrismaService.classroom.count.mockResolvedValue(10)

            const result = await repo.count(where)

            expect(prismaService.classroom.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(10)
        })

        it('should count classrooms with search filter', async () => {
            const where: Prisma.ClassroomWhereInput = {
                OR: [
                    { name: { contains: 'Math', mode: 'insensitive' } },
                    { description: { contains: 'Math', mode: 'insensitive' } },
                ],
            }

            mockPrismaService.classroom.count.mockResolvedValue(2)

            const result = await repo.count(where)

            expect(prismaService.classroom.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(2)
        })

        it('should count classrooms with complex filter', async () => {
            const where: Prisma.ClassroomWhereInput = {
                deletedAt: null,
                isArchived: false,
                OR: [
                    { name: { contains: 'test', mode: 'insensitive' } },
                    { description: { contains: 'test', mode: 'insensitive' } },
                ],
            }

            mockPrismaService.classroom.count.mockResolvedValue(1)

            const result = await repo.count(where)

            expect(prismaService.classroom.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(1)
        })

        it('should return 0 when no classrooms match', async () => {
            mockPrismaService.classroom.count.mockResolvedValue(0)

            const result = await repo.count({ name: 'nonexistent' })

            expect(result).toBe(0)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.classroom.count.mockRejectedValue(error)

            await expect(repo.count({})).rejects.toThrow(error)
        })
    })

    describe('findMany', () => {
        const mockClassrooms = [
            {
                id: 1,
                name: 'Classroom 1',
                description: 'Description 1',
                isArchived: false,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
                deletedAt: null,
            },
            {
                id: 2,
                name: 'Classroom 2',
                description: 'Description 2',
                isArchived: false,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
                deletedAt: null,
            },
        ]

        it('should find all classrooms with default parameters', async () => {
            const where: Prisma.ClassroomWhereInput = {}
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }
            const skip = 0
            const take = 10

            mockPrismaService.classroom.findMany.mockResolvedValue(mockClassrooms)

            const result = await repo.findMany(where, orderBy, skip, take)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip,
                take,
            })
            expect(result).toEqual(mockClassrooms)
            expect(result).toHaveLength(2)
        })

        it('should find classrooms with filter', async () => {
            const where: Prisma.ClassroomWhereInput = {
                isArchived: false,
            }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.classroom.findMany.mockResolvedValue(mockClassrooms)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockClassrooms)
        })

        it('should find classrooms sorted by name ascending', async () => {
            const where: Prisma.ClassroomWhereInput = {}
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { name: 'asc' }

            mockPrismaService.classroom.findMany.mockResolvedValue(mockClassrooms)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockClassrooms)
        })

        it('should find classrooms sorted by createdAt descending', async () => {
            const where: Prisma.ClassroomWhereInput = {}
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'desc' }

            const reversedClassrooms = [...mockClassrooms].reverse()
            mockPrismaService.classroom.findMany.mockResolvedValue(reversedClassrooms)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(reversedClassrooms)
        })

        it('should handle pagination with skip and take', async () => {
            const where: Prisma.ClassroomWhereInput = {}
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }
            const skip = 10
            const take = 5

            mockPrismaService.classroom.findMany.mockResolvedValue([mockClassrooms[0]])

            const result = await repo.findMany(where, orderBy, skip, take)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 10,
                take: 5,
            })
            expect(result).toHaveLength(1)
        })

        it('should find classrooms with deletedAt filter', async () => {
            const where: Prisma.ClassroomWhereInput = {
                deletedAt: null,
            }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.classroom.findMany.mockResolvedValue(mockClassrooms)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockClassrooms)
        })

        it('should find classrooms with search filter', async () => {
            const where: Prisma.ClassroomWhereInput = {
                OR: [
                    { name: { contains: 'Classroom', mode: 'insensitive' } },
                    { description: { contains: 'Classroom', mode: 'insensitive' } },
                ],
            }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.classroom.findMany.mockResolvedValue(mockClassrooms)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockClassrooms)
        })

        it('should find classrooms with complex filter', async () => {
            const where: Prisma.ClassroomWhereInput = {
                deletedAt: null,
                isArchived: false,
                OR: [
                    { name: { contains: '1', mode: 'insensitive' } },
                    { description: { contains: '1', mode: 'insensitive' } },
                ],
            }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { name: 'asc' }

            const filteredClassrooms = [mockClassrooms[0]]
            mockPrismaService.classroom.findMany.mockResolvedValue(filteredClassrooms)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(filteredClassrooms)
        })

        it('should return empty array when no classrooms found', async () => {
            const where: Prisma.ClassroomWhereInput = {
                name: 'nonexistent',
            }
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.classroom.findMany.mockResolvedValue([])

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(result).toEqual([])
            expect(result).toHaveLength(0)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.classroom.findMany.mockRejectedValue(error)

            await expect(repo.findMany({}, { createdAt: 'asc' }, 0, 10)).rejects.toThrow(error)
        })

        it('should handle edge case with zero take', async () => {
            const where: Prisma.ClassroomWhereInput = {}
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.classroom.findMany.mockResolvedValue([])

            const result = await repo.findMany(where, orderBy, 0, 0)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 0,
            })
            expect(result).toEqual([])
        })

        it('should handle large skip value', async () => {
            const where: Prisma.ClassroomWhereInput = {}
            const orderBy: Prisma.ClassroomOrderByWithRelationInput = { createdAt: 'asc' }

            mockPrismaService.classroom.findMany.mockResolvedValue([])

            const result = await repo.findMany(where, orderBy, 1000, 10)

            expect(prismaService.classroom.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 1000,
                take: 10,
            })
            expect(result).toEqual([])
        })
    })

    describe('findClassroomWithStdJreq', () => {
        const classroomId = 1

        const mockClassroomWithRelations = {
            id: 1,
            name: 'Classroom 1',
            description: 'Description 1',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            joinRequests: [
                {
                    id: 1,
                    classroomId: 1,
                    studentId: 1,
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    student: {
                        id: 1,
                        email: 'student@example.com',
                        fullName: 'Student Name',
                        phoneNumber: '0123456789',
                        isActive: true,
                        avatarMediaId: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                },
            ],
            classroomStudents: [
                {
                    id: 1,
                    classroomId: 1,
                    studentId: 2,
                    deletedAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    student: {
                        id: 2,
                        email: 'enrolled@example.com',
                        fullName: 'Enrolled Student',
                        phoneNumber: '0987654321',
                        isActive: true,
                        avatarMediaId: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                },
            ],
        }

        it('should find classroom with students and join requests', async () => {
            mockPrismaService.classroom.findUnique.mockResolvedValue(mockClassroomWithRelations)

            const result = await repo.findClassroomWithStdJreq(classroomId)

            expect(prismaService.classroom.findUnique).toHaveBeenCalledWith({
                where: { id: classroomId },
                include: {
                    joinRequests: {
                        where: { status: 'pending' },
                        include: {
                            student: {
                                omit: {
                                    passwordHash: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    classroomStudents: {
                        where: { deletedAt: null },
                        include: {
                            student: {
                                omit: {
                                    passwordHash: true,
                                    role: true,
                                },
                            },
                        },
                    },
                },
            })
            expect(result).toEqual(mockClassroomWithRelations)
        })

        it('should return classroom with empty join requests and students', async () => {
            const emptyRelations = {
                ...mockClassroomWithRelations,
                joinRequests: [],
                classroomStudents: [],
            }

            mockPrismaService.classroom.findUnique.mockResolvedValue(emptyRelations)

            const result = await repo.findClassroomWithStdJreq(classroomId)

            expect(result).toEqual(emptyRelations)
            expect(result?.joinRequests).toHaveLength(0)
            expect(result?.classroomStudents).toHaveLength(0)
        })

        it('should return null when classroom not found', async () => {
            mockPrismaService.classroom.findUnique.mockResolvedValue(null)

            const result = await repo.findClassroomWithStdJreq(classroomId)

            expect(result).toBeNull()
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.classroom.findUnique.mockRejectedValue(error)

            await expect(repo.findClassroomWithStdJreq(classroomId)).rejects.toThrow(error)
        })
    })

    describe('create', () => {
        const createData = {
            name: 'New Classroom',
            description: 'New Description',
        }

        const mockCreatedClassroom = {
            id: 1,
            name: 'New Classroom',
            description: 'New Description',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should create classroom successfully', async () => {
            mockPrismaService.classroom.create.mockResolvedValue(mockCreatedClassroom)

            const result = await repo.create(createData)

            expect(prismaService.classroom.create).toHaveBeenCalledWith({
                data: createData,
            })
            expect(result).toEqual(mockCreatedClassroom)
        })

        it('should create classroom with null description', async () => {
            const dataWithNullDescription = {
                name: 'New Classroom',
                description: null,
            }

            const createdClassroom = {
                ...mockCreatedClassroom,
                description: null,
            }

            mockPrismaService.classroom.create.mockResolvedValue(createdClassroom)

            const result = await repo.create(dataWithNullDescription)

            expect(prismaService.classroom.create).toHaveBeenCalledWith({
                data: dataWithNullDescription,
            })
            expect(result.description).toBeNull()
        })

        it('should propagate database errors', async () => {
            const error = new Error('Unique constraint violation')
            mockPrismaService.classroom.create.mockRejectedValue(error)

            await expect(repo.create(createData)).rejects.toThrow(error)
        })
    })

    describe('update', () => {
        const updateData = {
            id: 1,
            name: 'Updated Classroom',
            description: 'Updated Description',
        }

        const mockUpdatedClassroom = {
            id: 1,
            name: 'Updated Classroom',
            description: 'Updated Description',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should update classroom successfully', async () => {
            mockPrismaService.classroom.update.mockResolvedValue(mockUpdatedClassroom)

            const result = await repo.update(updateData)

            expect(prismaService.classroom.update).toHaveBeenCalledWith({
                where: { id: updateData.id },
                data: updateData,
            })
            expect(result).toEqual(mockUpdatedClassroom)
        })

        it('should update only specific fields', async () => {
            const partialUpdate = {
                id: 1,
                name: 'Only Name Updated',
            }

            const updatedClassroom = {
                ...mockUpdatedClassroom,
                name: 'Only Name Updated',
            }

            mockPrismaService.classroom.update.mockResolvedValue(updatedClassroom)

            const result = await repo.update(partialUpdate)

            expect(prismaService.classroom.update).toHaveBeenCalledWith({
                where: { id: partialUpdate.id },
                data: partialUpdate,
            })
            expect(result.name).toBe('Only Name Updated')
        })

        it('should update deletedAt field', async () => {
            const deleteUpdate = {
                id: 1,
                deletedAt: new Date(),
            }

            const deletedClassroom = {
                ...mockUpdatedClassroom,
                deletedAt: deleteUpdate.deletedAt,
            }

            mockPrismaService.classroom.update.mockResolvedValue(deletedClassroom)

            const result = await repo.update(deleteUpdate)

            expect(result.deletedAt).not.toBeNull()
        })

        it('should restore classroom by setting deletedAt to null', async () => {
            const restoreUpdate = {
                id: 1,
                deletedAt: null,
            }

            mockPrismaService.classroom.update.mockResolvedValue(mockUpdatedClassroom)

            const result = await repo.update(restoreUpdate)

            expect(prismaService.classroom.update).toHaveBeenCalledWith({
                where: { id: restoreUpdate.id },
                data: restoreUpdate,
            })
            expect(result.deletedAt).toBeNull()
        })

        it('should update isArchived status', async () => {
            const archiveUpdate = {
                id: 1,
                isArchived: true,
            }

            const archivedClassroom = {
                ...mockUpdatedClassroom,
                isArchived: true,
            }

            mockPrismaService.classroom.update.mockResolvedValue(archivedClassroom)

            const result = await repo.update(archiveUpdate)

            expect(result.isArchived).toBe(true)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Record not found')
            mockPrismaService.classroom.update.mockRejectedValue(error)

            await expect(repo.update(updateData)).rejects.toThrow(error)
        })
    })
})
