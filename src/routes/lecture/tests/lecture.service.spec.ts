import { Test, TestingModule } from '@nestjs/testing'
import { LectureService } from '../services/lecture.service'
import { ILectureRepo } from '../repos/lecture.interface.repo'
import { NotFoundException } from '@nestjs/common'
import { GetListLecturesQueryType, LectureSortByEnum } from '../dtos/queries/get-lectures.dto'
import { EnumOrder } from 'src/shared/constants/enum-order.constant'

describe('LectureService', () => {
    let service: LectureService
    let lectureRepo: ILectureRepo

    const mockLectureRepo = {
        count: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LectureService,
                {
                    provide: 'ILectureRepo',
                    useValue: mockLectureRepo,
                },
            ],
        }).compile()

        service = module.get<LectureService>(LectureService)
        lectureRepo = module.get<ILectureRepo>('ILectureRepo')
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createLecture', () => {
        const createData = {
            title: 'Test Lecture',
            content: 'Test content',
            parentId: 1,
            mediaId: 1,
        }

        const mockLecture = {
            id: 1,
            title: 'Test Lecture',
            content: 'Test content',
            parentId: 1,
            mediaId: 1,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should create a lecture successfully', async () => {
            mockLectureRepo.create.mockResolvedValue(mockLecture)

            const result = await service.createLecture(createData)

            expect(lectureRepo.create).toHaveBeenCalledWith({
                title: 'Test Lecture',
                content: 'Test content',
                parentId: 1,
                mediaId: 1,
            })
            expect(result).toEqual(mockLecture)
        })

        it('should create a lecture with null optional fields', async () => {
            const minimalData = {
                title: 'Minimal Lecture',
            }

            const minimalLecture = {
                id: 2,
                title: 'Minimal Lecture',
                content: null,
                parentId: null,
                mediaId: null,
                uploadedAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            }

            mockLectureRepo.create.mockResolvedValue(minimalLecture)

            const result = await service.createLecture(minimalData)

            expect(lectureRepo.create).toHaveBeenCalledWith({
                title: 'Minimal Lecture',
                content: null,
                parentId: null,
                mediaId: null,
            })
            expect(result).toEqual(minimalLecture)
        })

        it('should propagate repository errors', async () => {
            const error = new Error('Database error')
            mockLectureRepo.create.mockRejectedValue(error)

            await expect(service.createLecture(createData)).rejects.toThrow(error)
        })
    })

    describe('getLectureList', () => {
        const query: GetListLecturesQueryType = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: LectureSortByEnum.UPLOADED_AT,
        }

        const mockLectures = [
            {
                id: 1,
                title: 'Lecture 1',
                parentId: null,
                mediaId: null,
                uploadedAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            },
            {
                id: 2,
                title: 'Lecture 2',
                parentId: 1,
                mediaId: 1,
                uploadedAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            },
        ]

        it('should get lecture list with pagination', async () => {
            mockLectureRepo.count.mockResolvedValue(2)
            mockLectureRepo.findMany.mockResolvedValue(mockLectures)

            const result = await service.getLectureList(query)

            expect(lectureRepo.count).toHaveBeenCalledWith({
                deletedAt: null,
            })
            expect(lectureRepo.findMany).toHaveBeenCalledWith(
                { deletedAt: null },
                { uploadedAt: 'asc' },
                0,
                10,
            )
            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 2,
                data: mockLectures,
            })
        })

        it('should search lectures by title', async () => {
            const queryWithSearch = {
                ...query,
                search: 'Lecture 1',
            }

            const expectedWhereClause = {
                deletedAt: null,
                OR: [{ title: { contains: 'Lecture 1', mode: 'insensitive' } }],
            }

            mockLectureRepo.count.mockResolvedValue(1)
            mockLectureRepo.findMany.mockResolvedValue([mockLectures[0]])

            const result = await service.getLectureList(queryWithSearch)

            expect(lectureRepo.count).toHaveBeenCalledWith(expectedWhereClause)
            expect(lectureRepo.findMany).toHaveBeenCalledWith(
                expectedWhereClause,
                { uploadedAt: 'asc' },
                0,
                10,
            )
            expect(result.data).toHaveLength(1)
        })

        it('should sort lectures by specified field', async () => {
            const queryWithSort = {
                ...query,
                sortBy: LectureSortByEnum.TITLE,
                order: EnumOrder.DESC,
            }

            mockLectureRepo.count.mockResolvedValue(2)
            mockLectureRepo.findMany.mockResolvedValue(mockLectures)

            await service.getLectureList(queryWithSort)

            expect(lectureRepo.findMany).toHaveBeenCalledWith(
                { deletedAt: null },
                { title: 'desc' },
                0,
                10,
            )
        })

        it('should exclude content field from list response', async () => {
            const lecturesWithContent = [
                {
                    id: 1,
                    title: 'Lecture 1',
                    content: 'This is content',
                    parentId: null,
                    mediaId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ]

            mockLectureRepo.count.mockResolvedValue(1)
            mockLectureRepo.findMany.mockResolvedValue(lecturesWithContent)

            const result = await service.getLectureList(query)

            expect(result.data[0]).not.toHaveProperty('content')
            expect(result.data[0]).toHaveProperty('title')
            expect(result.data[0]).toHaveProperty('id')
        })

        it('should handle pagination on page 2', async () => {
            const page2Query = {
                ...query,
                page: 2,
                limit: 5,
            }

            mockLectureRepo.count.mockResolvedValue(10)
            mockLectureRepo.findMany.mockResolvedValue(mockLectures)

            await service.getLectureList(page2Query)

            expect(lectureRepo.findMany).toHaveBeenCalledWith(
                { deletedAt: null },
                { uploadedAt: 'asc' },
                5, // skip = (page - 1) * limit
                5,
            )
        })

        it('should return empty list when no lectures found', async () => {
            mockLectureRepo.count.mockResolvedValue(0)
            mockLectureRepo.findMany.mockResolvedValue([])

            const result = await service.getLectureList(query)

            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            })
        })
    })

    describe('getLectureById', () => {
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

        it('should get lecture by id successfully', async () => {
            mockLectureRepo.findById.mockResolvedValue(mockLecture)

            const result = await service.getLectureById(1)

            expect(lectureRepo.findById).toHaveBeenCalledWith(1)
            expect(result).toEqual(mockLecture)
        })

        it('should throw NotFoundException when lecture not found', async () => {
            mockLectureRepo.findById.mockResolvedValue(null)

            await expect(service.getLectureById(999)).rejects.toThrow(
                NotFoundException,
            )
            await expect(service.getLectureById(999)).rejects.toThrow(
                'Không tìm thấy bài giảng với ID 999',
            )
        })

        it('should include content field in detail response', async () => {
            mockLectureRepo.findById.mockResolvedValue(mockLecture)

            const result = await service.getLectureById(1)

            expect(result).toHaveProperty('content')
            expect(result.content).toBe('Test content')
        })
    })

    describe('updateLecture', () => {
        const existingLecture = {
            id: 1,
            title: 'Original Title',
            content: 'Original content',
            parentId: null,
            mediaId: null,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        const updateData = {
            title: 'Updated Title',
            content: 'Updated content',
        }

        const updatedLecture = {
            ...existingLecture,
            ...updateData,
            updatedAt: new Date(),
        }

        it('should update lecture successfully', async () => {
            mockLectureRepo.findById.mockResolvedValue(existingLecture)
            mockLectureRepo.update.mockResolvedValue(updatedLecture)

            const result = await service.updateLecture(1, updateData)

            expect(lectureRepo.findById).toHaveBeenCalledWith(1)
            expect(lectureRepo.update).toHaveBeenCalledWith(1, updateData)
            expect(result).toEqual(updatedLecture)
        })

        it('should throw NotFoundException when lecture not found', async () => {
            mockLectureRepo.findById.mockResolvedValue(null)

            await expect(service.updateLecture(999, updateData)).rejects.toThrow(
                NotFoundException,
            )
            await expect(service.updateLecture(999, updateData)).rejects.toThrow(
                'Không tìm thấy bài giảng với ID 999',
            )
            expect(lectureRepo.update).not.toHaveBeenCalled()
        })

        it('should update partial fields', async () => {
            const partialUpdate = {
                title: 'Only Title Updated',
            }

            const partialUpdatedLecture = {
                ...existingLecture,
                title: 'Only Title Updated',
            }

            mockLectureRepo.findById.mockResolvedValue(existingLecture)
            mockLectureRepo.update.mockResolvedValue(partialUpdatedLecture)

            const result = await service.updateLecture(1, partialUpdate)

            expect(lectureRepo.update).toHaveBeenCalledWith(1, partialUpdate)
            expect(result.title).toBe('Only Title Updated')
            expect(result.content).toBe('Original content')
        })

        it('should propagate repository errors', async () => {
            const error = new Error('Database error')
            mockLectureRepo.findById.mockResolvedValue(existingLecture)
            mockLectureRepo.update.mockRejectedValue(error)

            await expect(service.updateLecture(1, updateData)).rejects.toThrow(error)
        })
    })

    describe('deleteLecture', () => {
        const existingLecture = {
            id: 1,
            title: 'Test Lecture',
            content: 'Test content',
            parentId: null,
            mediaId: null,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should soft delete lecture successfully', async () => {
            mockLectureRepo.findById.mockResolvedValue(existingLecture)
            mockLectureRepo.softDelete.mockResolvedValue({
                ...existingLecture,
                deletedAt: new Date(),
            })

            const result = await service.deleteLecture(1)

            expect(lectureRepo.findById).toHaveBeenCalledWith(1)
            expect(lectureRepo.softDelete).toHaveBeenCalledWith(1)
            expect(result).toEqual({ message: 'Xóa bài giảng thành công' })
        })

        it('should throw NotFoundException when lecture not found', async () => {
            mockLectureRepo.findById.mockResolvedValue(null)

            await expect(service.deleteLecture(999)).rejects.toThrow(
                NotFoundException,
            )
            await expect(service.deleteLecture(999)).rejects.toThrow(
                'Không tìm thấy bài giảng với ID 999',
            )
            expect(lectureRepo.softDelete).not.toHaveBeenCalled()
        })

        it('should propagate repository errors', async () => {
            const error = new Error('Database error')
            mockLectureRepo.findById.mockResolvedValue(existingLecture)
            mockLectureRepo.softDelete.mockRejectedValue(error)

            await expect(service.deleteLecture(1)).rejects.toThrow(error)
        })
    })
})
