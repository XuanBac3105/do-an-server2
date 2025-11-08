import { Test, TestingModule } from '@nestjs/testing'
import { LectureRepo } from '../repos/lecture.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import { Prisma } from '@prisma/client'

describe('LectureRepo', () => {
    let repo: LectureRepo
    let prismaService: PrismaService

    const mockPrismaService = {
        lecture: {
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
                LectureRepo,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile()

        repo = module.get<LectureRepo>(LectureRepo)
        prismaService = module.get<PrismaService>(PrismaService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(repo).toBeDefined()
    })

    describe('count', () => {
        it('should count all lectures', async () => {
            mockPrismaService.lecture.count.mockResolvedValue(5)

            const result = await repo.count({})

            expect(prismaService.lecture.count).toHaveBeenCalledWith({ where: {} })
            expect(result).toBe(5)
        })

        it('should count lectures with filter', async () => {
            const where: Prisma.LectureWhereInput = {
                deletedAt: null,
            }

            mockPrismaService.lecture.count.mockResolvedValue(3)

            const result = await repo.count(where)

            expect(prismaService.lecture.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(3)
        })

        it('should count lectures with search filter', async () => {
            const where: Prisma.LectureWhereInput = {
                OR: [{ title: { contains: 'Test', mode: 'insensitive' } }],
            }

            mockPrismaService.lecture.count.mockResolvedValue(2)

            const result = await repo.count(where)

            expect(prismaService.lecture.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(2)
        })

        it('should count lectures with complex filter', async () => {
            const where: Prisma.LectureWhereInput = {
                deletedAt: null,
                parentId: 1,
                OR: [{ title: { contains: 'lecture', mode: 'insensitive' } }],
            }

            mockPrismaService.lecture.count.mockResolvedValue(1)

            const result = await repo.count(where)

            expect(prismaService.lecture.count).toHaveBeenCalledWith({ where })
            expect(result).toBe(1)
        })

        it('should return 0 when no lectures match', async () => {
            mockPrismaService.lecture.count.mockResolvedValue(0)

            const result = await repo.count({ id: 999 })

            expect(result).toBe(0)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.lecture.count.mockRejectedValue(error)

            await expect(repo.count({})).rejects.toThrow(error)
        })
    })

    describe('findMany', () => {
        const mockLectures = [
            {
                id: 1,
                title: 'Lecture 1',
                content: 'Content 1',
                parentId: null,
                mediaId: null,
                uploadedAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
                deletedAt: null,
            },
            {
                id: 2,
                title: 'Lecture 2',
                content: 'Content 2',
                parentId: 1,
                mediaId: 1,
                uploadedAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
                deletedAt: null,
            },
        ]

        it('should find all lectures with default parameters', async () => {
            const where: Prisma.LectureWhereInput = {}
            const orderBy: Prisma.LectureOrderByWithRelationInput = { uploadedAt: 'asc' }
            const skip = 0
            const take = 10

            mockPrismaService.lecture.findMany.mockResolvedValue(mockLectures)

            const result = await repo.findMany(where, orderBy, skip, take)

            expect(prismaService.lecture.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip,
                take,
            })
            expect(result).toEqual(mockLectures)
            expect(result).toHaveLength(2)
        })

        it('should find lectures with filter', async () => {
            const where: Prisma.LectureWhereInput = {
                deletedAt: null,
            }
            const orderBy: Prisma.LectureOrderByWithRelationInput = { uploadedAt: 'asc' }

            mockPrismaService.lecture.findMany.mockResolvedValue(mockLectures)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.lecture.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockLectures)
        })

        it('should find lectures sorted by title ascending', async () => {
            const where: Prisma.LectureWhereInput = {}
            const orderBy: Prisma.LectureOrderByWithRelationInput = { title: 'asc' }

            mockPrismaService.lecture.findMany.mockResolvedValue(mockLectures)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.lecture.findMany).toHaveBeenCalledWith({
                where,
                orderBy: { title: 'asc' },
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(mockLectures)
        })

        it('should find lectures sorted by title descending', async () => {
            const where: Prisma.LectureWhereInput = {}
            const orderBy: Prisma.LectureOrderByWithRelationInput = { title: 'desc' }

            const reversedLectures = [...mockLectures].reverse()
            mockPrismaService.lecture.findMany.mockResolvedValue(reversedLectures)

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(prismaService.lecture.findMany).toHaveBeenCalledWith({
                where,
                orderBy: { title: 'desc' },
                skip: 0,
                take: 10,
            })
            expect(result).toEqual(reversedLectures)
        })

        it('should handle pagination with skip and take', async () => {
            const where: Prisma.LectureWhereInput = {}
            const orderBy: Prisma.LectureOrderByWithRelationInput = { uploadedAt: 'asc' }
            const skip = 10
            const take = 5

            mockPrismaService.lecture.findMany.mockResolvedValue([mockLectures[0]])

            const result = await repo.findMany(where, orderBy, skip, take)

            expect(prismaService.lecture.findMany).toHaveBeenCalledWith({
                where,
                orderBy,
                skip: 10,
                take: 5,
            })
            expect(result).toHaveLength(1)
        })

        it('should find lectures with search filter', async () => {
            const where: Prisma.LectureWhereInput = {
                OR: [{ title: { contains: 'Lecture 1', mode: 'insensitive' } }],
            }
            const orderBy: Prisma.LectureOrderByWithRelationInput = { uploadedAt: 'asc' }

            mockPrismaService.lecture.findMany.mockResolvedValue([mockLectures[0]])

            const result = await repo.findMany(where, orderBy, 0, 10)

            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Lecture 1')
        })

        it('should return empty array when no lectures found', async () => {
            mockPrismaService.lecture.findMany.mockResolvedValue([])

            const result = await repo.findMany({}, {}, 0, 10)

            expect(result).toEqual([])
            expect(result).toHaveLength(0)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.lecture.findMany.mockRejectedValue(error)

            await expect(repo.findMany({}, {}, 0, 10)).rejects.toThrow(error)
        })
    })

    describe('findById', () => {
        const mockLecture = {
            id: 1,
            title: 'Test Lecture',
            content: 'Test content',
            parentId: null,
            mediaId: null,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should find lecture by id successfully', async () => {
            mockPrismaService.lecture.findUnique.mockResolvedValue(mockLecture)

            const result = await repo.findById(1)

            expect(prismaService.lecture.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    deletedAt: null,
                },
            })
            expect(result).toEqual(mockLecture)
        })

        it('should return null when lecture not found', async () => {
            mockPrismaService.lecture.findUnique.mockResolvedValue(null)

            const result = await repo.findById(999)

            expect(prismaService.lecture.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 999,
                    deletedAt: null,
                },
            })
            expect(result).toBeNull()
        })

        it('should not find soft deleted lecture', async () => {
            mockPrismaService.lecture.findUnique.mockResolvedValue(null)

            const result = await repo.findById(1)

            expect(result).toBeNull()
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.lecture.findUnique.mockRejectedValue(error)

            await expect(repo.findById(1)).rejects.toThrow(error)
        })
    })

    describe('create', () => {
        const createData = {
            title: 'New Lecture',
            content: 'New content',
            parentId: 1,
            mediaId: 1,
        }

        const createdLecture = {
            id: 1,
            ...createData,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should create lecture successfully', async () => {
            mockPrismaService.lecture.create.mockResolvedValue(createdLecture)

            const result = await repo.create(createData)

            expect(prismaService.lecture.create).toHaveBeenCalledWith({
                data: createData,
            })
            expect(result).toEqual(createdLecture)
        })

        it('should create lecture with null optional fields', async () => {
            const minimalData = {
                title: 'Minimal Lecture',
                content: null,
                parentId: null,
                mediaId: null,
            }

            const minimalLecture = {
                id: 2,
                ...minimalData,
                uploadedAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            }

            mockPrismaService.lecture.create.mockResolvedValue(minimalLecture)

            const result = await repo.create(minimalData)

            expect(prismaService.lecture.create).toHaveBeenCalledWith({
                data: minimalData,
            })
            expect(result).toEqual(minimalLecture)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database constraint violation')
            mockPrismaService.lecture.create.mockRejectedValue(error)

            await expect(repo.create(createData)).rejects.toThrow(error)
        })
    })

    describe('update', () => {
        const updateData = {
            title: 'Updated Lecture',
            content: 'Updated content',
        }

        const updatedLecture = {
            id: 1,
            title: 'Updated Lecture',
            content: 'Updated content',
            parentId: null,
            mediaId: null,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should update lecture successfully', async () => {
            mockPrismaService.lecture.update.mockResolvedValue(updatedLecture)

            const result = await repo.update(1, updateData)

            expect(prismaService.lecture.update).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    deletedAt: null,
                },
                data: updateData,
            })
            expect(result).toEqual(updatedLecture)
        })

        it('should update partial fields', async () => {
            const partialData = {
                title: 'Only Title Updated',
            }

            const partialUpdatedLecture = {
                ...updatedLecture,
                title: 'Only Title Updated',
            }

            mockPrismaService.lecture.update.mockResolvedValue(partialUpdatedLecture)

            const result = await repo.update(1, partialData)

            expect(prismaService.lecture.update).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    deletedAt: null,
                },
                data: partialData,
            })
            expect(result.title).toBe('Only Title Updated')
        })

        it('should not update soft deleted lecture', async () => {
            const error = new Error('Record not found')
            mockPrismaService.lecture.update.mockRejectedValue(error)

            await expect(repo.update(1, updateData)).rejects.toThrow(error)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database constraint violation')
            mockPrismaService.lecture.update.mockRejectedValue(error)

            await expect(repo.update(1, updateData)).rejects.toThrow(error)
        })
    })

    describe('softDelete', () => {
        const deletedLecture = {
            id: 1,
            title: 'Test Lecture',
            content: 'Test content',
            parentId: null,
            mediaId: null,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            deletedAt: new Date(),
        }

        it('should soft delete lecture successfully', async () => {
            mockPrismaService.lecture.update.mockResolvedValue(deletedLecture)

            const result = await repo.softDelete(1)

            expect(prismaService.lecture.update).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    deletedAt: null,
                },
                data: {
                    deletedAt: expect.any(Date),
                },
            })
            expect(result).toEqual(deletedLecture)
            expect(result.deletedAt).not.toBeNull()
        })

        it('should not soft delete already deleted lecture', async () => {
            const error = new Error('Record not found')
            mockPrismaService.lecture.update.mockRejectedValue(error)

            await expect(repo.softDelete(1)).rejects.toThrow(error)
        })

        it('should propagate database errors', async () => {
            const error = new Error('Database connection failed')
            mockPrismaService.lecture.update.mockRejectedValue(error)

            await expect(repo.softDelete(1)).rejects.toThrow(error)
        })
    })
})
