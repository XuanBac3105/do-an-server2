import { Test, TestingModule } from '@nestjs/testing'
import { MediaRepo } from '../repos/media.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import { Media, Prisma } from '@prisma/client'

describe('MediaRepo', () => {
    let repo: MediaRepo
    let prisma: PrismaService

    const mockMedia: Media = {
        id: 1,
        disk: 'minio',
        bucket: 'test-bucket',
        objectKey: 'test/file.pdf',
        mimeType: 'application/pdf',
        sizeBytes: BigInt(1024),
        visibility: 'private',
        uploadedBy: 1,
        createdAt: new Date(),
        deletedAt: null,
    }

    const mockPrismaService = {
        media: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            aggregate: jest.fn(),
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MediaRepo,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile()

        repo = module.get<MediaRepo>(MediaRepo)
        prisma = module.get<PrismaService>(PrismaService)

        // Clear all mocks before each test
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(repo).toBeDefined()
    })

    describe('create', () => {
        it('should create a media record', async () => {
            const createInput: Prisma.MediaCreateInput = {
                disk: 'minio',
                bucket: 'test-bucket',
                objectKey: 'test/file.pdf',
                mimeType: 'application/pdf',
                sizeBytes: BigInt(1024),
                visibility: 'private',
                uploader: {
                    connect: { id: 1 },
                },
            }

            mockPrismaService.media.create.mockResolvedValue(mockMedia)

            const result = await repo.create(createInput)

            expect(result).toEqual(mockMedia)
            expect(mockPrismaService.media.create).toHaveBeenCalledWith({
                data: createInput,
            })
        })
    })

    describe('findById', () => {
        it('should find media by id without relations', async () => {
            mockPrismaService.media.findUnique.mockResolvedValue(mockMedia)

            const result = await repo.findById(1, false)

            expect(result).toEqual(mockMedia)
            expect(mockPrismaService.media.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: undefined,
            })
        })

        it('should find media by id with relations', async () => {
            const mediaWithUploader = {
                ...mockMedia,
                uploader: {
                    id: 1,
                    fullName: 'Test User',
                    email: 'test@example.com',
                    role: 'student',
                },
            }

            mockPrismaService.media.findUnique.mockResolvedValue(mediaWithUploader)

            const result = await repo.findById(1, true)

            expect(result).toEqual(mediaWithUploader)
            expect(mockPrismaService.media.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    uploader: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            })
        })

        it('should return null when media not found', async () => {
            mockPrismaService.media.findUnique.mockResolvedValue(null)

            const result = await repo.findById(999)

            expect(result).toBeNull()
        })
    })

    describe('findByBucketAndKey', () => {
        it('should find media by bucket and objectKey', async () => {
            mockPrismaService.media.findUnique.mockResolvedValue(mockMedia)

            const result = await repo.findByBucketAndKey('test-bucket', 'test/file.pdf')

            expect(result).toEqual(mockMedia)
            expect(mockPrismaService.media.findUnique).toHaveBeenCalledWith({
                where: {
                    bucket_objectKey: {
                        bucket: 'test-bucket',
                        objectKey: 'test/file.pdf',
                    },
                },
            })
        })
    })

    describe('findByUploader', () => {
        it('should find media by uploader without deleted', async () => {
            mockPrismaService.media.findMany.mockResolvedValue([mockMedia])

            const result = await repo.findByUploader(1)

            expect(result).toEqual([mockMedia])
            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    uploadedBy: 1,
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: undefined,
                take: undefined,
            })
        })

        it('should find media by uploader with pagination', async () => {
            mockPrismaService.media.findMany.mockResolvedValue([mockMedia])

            const result = await repo.findByUploader(1, {
                skip: 10,
                take: 20,
            })

            expect(result).toEqual([mockMedia])
            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    uploadedBy: 1,
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: 10,
                take: 20,
            })
        })

        it('should find media by uploader including deleted', async () => {
            mockPrismaService.media.findMany.mockResolvedValue([mockMedia])

            const result = await repo.findByUploader(1, {
                includeDeleted: true,
            })

            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    uploadedBy: 1,
                    deletedAt: undefined,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: undefined,
                take: undefined,
            })
        })
    })

    describe('findByVisibility', () => {
        it('should find media by visibility', async () => {
            mockPrismaService.media.findMany.mockResolvedValue([mockMedia])

            const result = await repo.findByVisibility('public')

            expect(result).toEqual([mockMedia])
            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    visibility: 'public',
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: undefined,
                take: undefined,
            })
        })

        it('should find media by visibility with pagination', async () => {
            mockPrismaService.media.findMany.mockResolvedValue([mockMedia])

            const result = await repo.findByVisibility('private', {
                skip: 5,
                take: 10,
            })

            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    visibility: 'private',
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: 5,
                take: 10,
            })
        })
    })

    describe('softDelete', () => {
        it('should soft delete media', async () => {
            const deletedMedia = { ...mockMedia, deletedAt: new Date() }
            mockPrismaService.media.update.mockResolvedValue(deletedMedia)

            const result = await repo.softDelete(1)

            expect(result).toEqual(deletedMedia)
            expect(mockPrismaService.media.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    deletedAt: expect.any(Date),
                },
            })
        })
    })

    describe('hardDelete', () => {
        it('should hard delete media', async () => {
            mockPrismaService.media.delete.mockResolvedValue(mockMedia)

            const result = await repo.hardDelete(1)

            expect(result).toEqual(mockMedia)
            expect(mockPrismaService.media.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            })
        })
    })

    describe('restore', () => {
        it('should restore soft deleted media', async () => {
            mockPrismaService.media.update.mockResolvedValue(mockMedia)

            const result = await repo.restore(1)

            expect(result).toEqual(mockMedia)
            expect(mockPrismaService.media.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    deletedAt: null,
                },
            })
        })
    })

    describe('update', () => {
        it('should update media', async () => {
            const updateData: Prisma.MediaUpdateInput = {
                visibility: 'public',
            }
            const updatedMedia = { ...mockMedia, visibility: 'public' }

            mockPrismaService.media.update.mockResolvedValue(updatedMedia)

            const result = await repo.update(1, updateData)

            expect(result).toEqual(updatedMedia)
            expect(mockPrismaService.media.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
            })
        })
    })

    describe('countByUploader', () => {
        it('should count media by uploader excluding deleted', async () => {
            mockPrismaService.media.count.mockResolvedValue(10)

            const result = await repo.countByUploader(1)

            expect(result).toBe(10)
            expect(mockPrismaService.media.count).toHaveBeenCalledWith({
                where: {
                    uploadedBy: 1,
                    deletedAt: null,
                },
            })
        })

        it('should count media by uploader including deleted', async () => {
            mockPrismaService.media.count.mockResolvedValue(15)

            const result = await repo.countByUploader(1, true)

            expect(result).toBe(15)
            expect(mockPrismaService.media.count).toHaveBeenCalledWith({
                where: {
                    uploadedBy: 1,
                    deletedAt: undefined,
                },
            })
        })
    })

    describe('getTotalSizeByUploader', () => {
        it('should get total size by uploader', async () => {
            mockPrismaService.media.aggregate.mockResolvedValue({
                _sum: {
                    sizeBytes: BigInt(10240),
                },
            })

            const result = await repo.getTotalSizeByUploader(1)

            expect(result).toBe(BigInt(10240))
            expect(mockPrismaService.media.aggregate).toHaveBeenCalledWith({
                where: {
                    uploadedBy: 1,
                    deletedAt: null,
                },
                _sum: {
                    sizeBytes: true,
                },
            })
        })

        it('should return 0 when no media found', async () => {
            mockPrismaService.media.aggregate.mockResolvedValue({
                _sum: {
                    sizeBytes: null,
                },
            })

            const result = await repo.getTotalSizeByUploader(1)

            expect(result).toBe(BigInt(0))
        })
    })

    describe('findByMimeType', () => {
        it('should find media by mime type', async () => {
            mockPrismaService.media.findMany.mockResolvedValue([mockMedia])

            const result = await repo.findByMimeType('application/pdf')

            expect(result).toEqual([mockMedia])
            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    mimeType: {
                        contains: 'application/pdf',
                    },
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: undefined,
                take: undefined,
            })
        })

        it('should find media by mime type with pagination', async () => {
            mockPrismaService.media.findMany.mockResolvedValue([mockMedia])

            const result = await repo.findByMimeType('image/', {
                skip: 0,
                take: 20,
            })

            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    mimeType: {
                        contains: 'image/',
                    },
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: 0,
                take: 20,
            })
        })
    })

    describe('findDeleted', () => {
        it('should find deleted media', async () => {
            const deletedMedia = { ...mockMedia, deletedAt: new Date() }
            mockPrismaService.media.findMany.mockResolvedValue([deletedMedia])

            const result = await repo.findDeleted()

            expect(result).toEqual([deletedMedia])
            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    deletedAt: {
                        not: null,
                    },
                },
                orderBy: {
                    deletedAt: 'desc',
                },
                skip: undefined,
                take: undefined,
            })
        })

        it('should find deleted media with pagination', async () => {
            const deletedMedia = { ...mockMedia, deletedAt: new Date() }
            mockPrismaService.media.findMany.mockResolvedValue([deletedMedia])

            const result = await repo.findDeleted({
                skip: 10,
                take: 5,
            })

            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    deletedAt: {
                        not: null,
                    },
                },
                orderBy: {
                    deletedAt: 'desc',
                },
                skip: 10,
                take: 5,
            })
        })
    })

    describe('createMany', () => {
        it('should create multiple media records', async () => {
            const createManyInput: Prisma.MediaCreateManyInput[] = [
                {
                    disk: 'minio',
                    bucket: 'test-bucket',
                    objectKey: 'test/file1.pdf',
                    mimeType: 'application/pdf',
                    sizeBytes: BigInt(1024),
                    visibility: 'private',
                    uploadedBy: 1,
                },
                {
                    disk: 'minio',
                    bucket: 'test-bucket',
                    objectKey: 'test/file2.pdf',
                    mimeType: 'application/pdf',
                    sizeBytes: BigInt(2048),
                    visibility: 'private',
                    uploadedBy: 1,
                },
            ]

            mockPrismaService.media.createMany.mockResolvedValue({ count: 2 })

            const result = await repo.createMany(createManyInput)

            expect(result.count).toBe(2)
            expect(mockPrismaService.media.createMany).toHaveBeenCalledWith({
                data: createManyInput,
            })
        })
    })

    describe('deleteMany', () => {
        it('should delete multiple media records', async () => {
            mockPrismaService.media.deleteMany.mockResolvedValue({ count: 3 })

            const result = await repo.deleteMany([1, 2, 3])

            expect(result.count).toBe(3)
            expect(mockPrismaService.media.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: {
                        in: [1, 2, 3],
                    },
                },
            })
        })
    })

    describe('findByDisk', () => {
        it('should find media by disk', async () => {
            mockPrismaService.media.findMany.mockResolvedValue([mockMedia])

            const result = await repo.findByDisk('minio')

            expect(result).toEqual([mockMedia])
            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    disk: 'minio',
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: undefined,
                take: undefined,
            })
        })

        it('should find media by disk with pagination', async () => {
            mockPrismaService.media.findMany.mockResolvedValue([mockMedia])

            const result = await repo.findByDisk('s3', {
                skip: 5,
                take: 15,
            })

            expect(mockPrismaService.media.findMany).toHaveBeenCalledWith({
                where: {
                    disk: 's3',
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: 5,
                take: 15,
            })
        })
    })

    describe('isMediaInUse', () => {
        it('should return true when media is in use', async () => {
            const mediaInUse = {
                ...mockMedia,
                userAvatars: [{ id: 1 }],
                classroomCovers: [],
                exerciseAttachments: [],
                exerciseSubmissions: [],
                quizQuestionGroupMedias: [],
                quizQuestionMedias: [],
                quizOptionMedias: [],
                lectures: [],
            }

            mockPrismaService.media.findUnique.mockResolvedValue(mediaInUse)

            const result = await repo.isMediaInUse(1)

            expect(result).toBe(true)
            expect(mockPrismaService.media.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    userAvatars: true,
                    classroomCovers: true,
                    exerciseAttachments: true,
                    exerciseSubmissions: true,
                    quizQuestionGroupMedias: true,
                    quizQuestionMedias: true,
                    quizOptionMedias: true,
                    lectures: true,
                },
            })
        })

        it('should return false when media is not in use', async () => {
            const mediaNotInUse = {
                ...mockMedia,
                userAvatars: [],
                classroomCovers: [],
                exerciseAttachments: [],
                exerciseSubmissions: [],
                quizQuestionGroupMedias: [],
                quizQuestionMedias: [],
                quizOptionMedias: [],
                lectures: [],
            }

            mockPrismaService.media.findUnique.mockResolvedValue(mediaNotInUse)

            const result = await repo.isMediaInUse(1)

            expect(result).toBe(false)
        })

        it('should return false when media not found', async () => {
            mockPrismaService.media.findUnique.mockResolvedValue(null)

            const result = await repo.isMediaInUse(999)

            expect(result).toBe(false)
        })
    })
})
