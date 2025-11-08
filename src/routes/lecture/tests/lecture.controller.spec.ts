import { Test, TestingModule } from '@nestjs/testing'
import { LectureController } from '../lecture.controller'
import { ILectureService } from '../services/lecture.interface.service'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { GetListLecturesQueryDto, LectureSortByEnum } from '../dtos/queries/get-lectures.dto'
import { CreateLectureReqDto } from '../dtos/requests/create-lecture-req.dto'
import { UpdateLectureReqDto } from '../dtos/requests/update-lecture-req.dto'
import { EnumOrder } from 'src/shared/constants/enum-order.constant'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { NotFoundException } from '@nestjs/common'

describe('LectureController', () => {
    let controller: LectureController
    let lectureService: ILectureService

    const mockLectureService = {
        getLectureList: jest.fn(),
        getLectureById: jest.fn(),
        createLecture: jest.fn(),
        updateLecture: jest.fn(),
        deleteLecture: jest.fn(),
    }

    const mockRoleGuard = {
        canActivate: jest.fn(() => true),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LectureController],
            providers: [
                {
                    provide: 'ILectureService',
                    useValue: mockLectureService,
                },
            ],
        })
            .overrideGuard(RoleGuard)
            .useValue(mockRoleGuard)
            .compile()

        controller = module.get<LectureController>(LectureController)
        lectureService = module.get<ILectureService>('ILectureService')
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('getLectureList', () => {
        const validQuery: GetListLecturesQueryDto = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: LectureSortByEnum.UPLOADED_AT,
        } as GetListLecturesQueryDto

        const expectedResponse = {
            page: 1,
            limit: 10,
            total: 2,
            data: [
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
            ],
        }

        it('should get lecture list successfully', async () => {
            mockLectureService.getLectureList.mockResolvedValue(expectedResponse)

            const result = await controller.getLectureList(validQuery)

            expect(lectureService.getLectureList).toHaveBeenCalledWith(validQuery)
            expect(lectureService.getLectureList).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should get lectures with search filter', async () => {
            const queryWithSearch = {
                ...validQuery,
                search: 'Test',
            } as GetListLecturesQueryDto

            const searchResponse = {
                page: 1,
                limit: 10,
                total: 1,
                data: [
                    {
                        id: 1,
                        title: 'Test Lecture',
                        parentId: null,
                        mediaId: null,
                        uploadedAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                    },
                ],
            }

            mockLectureService.getLectureList.mockResolvedValue(searchResponse)

            const result = await controller.getLectureList(queryWithSearch)

            expect(lectureService.getLectureList).toHaveBeenCalledWith(queryWithSearch)
            expect(result).toEqual(searchResponse)
        })

        it('should get lectures sorted by different fields', async () => {
            const queryWithSortBy = {
                ...validQuery,
                sortBy: LectureSortByEnum.TITLE,
                order: EnumOrder.DESC,
            } as GetListLecturesQueryDto

            mockLectureService.getLectureList.mockResolvedValue(expectedResponse)

            const result = await controller.getLectureList(queryWithSortBy)

            expect(lectureService.getLectureList).toHaveBeenCalledWith(queryWithSortBy)
            expect(result).toEqual(expectedResponse)
        })

        it('should return empty data when no lectures found', async () => {
            const emptyResponse = {
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            }

            mockLectureService.getLectureList.mockResolvedValue(emptyResponse)

            const result = await controller.getLectureList(validQuery)

            expect(result).toEqual(emptyResponse)
            expect(result.data).toHaveLength(0)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockLectureService.getLectureList.mockRejectedValue(error)

            await expect(controller.getLectureList(validQuery)).rejects.toThrow(error)
        })
    })

    describe('getLectureById', () => {
        const validParam: GetIdParamDto = { id: 1 } as GetIdParamDto

        const expectedLecture = {
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
            mockLectureService.getLectureById.mockResolvedValue(expectedLecture)

            const result = await controller.getLectureById(validParam)

            expect(lectureService.getLectureById).toHaveBeenCalledWith(1)
            expect(lectureService.getLectureById).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedLecture)
        })

        it('should include content in detail response', async () => {
            mockLectureService.getLectureById.mockResolvedValue(expectedLecture)

            const result = await controller.getLectureById(validParam)

            expect(result).toHaveProperty('content')
            expect(result.content).toBe('Test content')
        })

        it('should throw NotFoundException when lecture not found', async () => {
            mockLectureService.getLectureById.mockRejectedValue(
                new NotFoundException('Không tìm thấy bài giảng với ID 999'),
            )

            await expect(
                controller.getLectureById({ id: 999 } as GetIdParamDto),
            ).rejects.toThrow(NotFoundException)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockLectureService.getLectureById.mockRejectedValue(error)

            await expect(controller.getLectureById(validParam)).rejects.toThrow(error)
        })
    })

    describe('createLecture', () => {
        const createDto: CreateLectureReqDto = {
            title: 'New Lecture',
            content: 'New content',
            parentId: 1,
            mediaId: 1,
        } as CreateLectureReqDto

        const createdLecture = {
            id: 1,
            title: 'New Lecture',
            content: 'New content',
            parentId: 1,
            mediaId: 1,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should create lecture successfully', async () => {
            mockLectureService.createLecture.mockResolvedValue(createdLecture)

            const result = await controller.createLecture(createDto)

            expect(lectureService.createLecture).toHaveBeenCalledWith(createDto)
            expect(lectureService.createLecture).toHaveBeenCalledTimes(1)
            expect(result).toEqual(createdLecture)
        })

        it('should create lecture with minimal fields', async () => {
            const minimalDto: CreateLectureReqDto = {
                title: 'Minimal Lecture',
            } as CreateLectureReqDto

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

            mockLectureService.createLecture.mockResolvedValue(minimalLecture)

            const result = await controller.createLecture(minimalDto)

            expect(lectureService.createLecture).toHaveBeenCalledWith(minimalDto)
            expect(result).toEqual(minimalLecture)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockLectureService.createLecture.mockRejectedValue(error)

            await expect(controller.createLecture(createDto)).rejects.toThrow(error)
        })
    })

    describe('updateLecture', () => {
        const validParam: GetIdParamDto = { id: 1 } as GetIdParamDto
        const updateDto: UpdateLectureReqDto = {
            title: 'Updated Lecture',
            content: 'Updated content',
        } as UpdateLectureReqDto

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
            mockLectureService.updateLecture.mockResolvedValue(updatedLecture)

            const result = await controller.updateLecture(validParam, updateDto)

            expect(lectureService.updateLecture).toHaveBeenCalledWith(1, updateDto)
            expect(lectureService.updateLecture).toHaveBeenCalledTimes(1)
            expect(result).toEqual(updatedLecture)
        })

        it('should update partial fields', async () => {
            const partialDto: UpdateLectureReqDto = {
                title: 'Only Title Updated',
            } as UpdateLectureReqDto

            const partialUpdatedLecture = {
                ...updatedLecture,
                title: 'Only Title Updated',
            }

            mockLectureService.updateLecture.mockResolvedValue(partialUpdatedLecture)

            const result = await controller.updateLecture(validParam, partialDto)

            expect(lectureService.updateLecture).toHaveBeenCalledWith(1, partialDto)
            expect(result.title).toBe('Only Title Updated')
        })

        it('should throw NotFoundException when lecture not found', async () => {
            mockLectureService.updateLecture.mockRejectedValue(
                new NotFoundException('Không tìm thấy bài giảng với ID 999'),
            )

            await expect(
                controller.updateLecture({ id: 999 } as GetIdParamDto, updateDto),
            ).rejects.toThrow(NotFoundException)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockLectureService.updateLecture.mockRejectedValue(error)

            await expect(controller.updateLecture(validParam, updateDto)).rejects.toThrow(
                error,
            )
        })
    })

    describe('deleteLecture', () => {
        const validParam: GetIdParamDto = { id: 1 } as GetIdParamDto

        it('should delete lecture successfully', async () => {
            const expectedResponse = { message: 'Xóa bài giảng thành công' }
            mockLectureService.deleteLecture.mockResolvedValue(expectedResponse)

            const result = await controller.deleteLecture(validParam)

            expect(lectureService.deleteLecture).toHaveBeenCalledWith(1)
            expect(lectureService.deleteLecture).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should throw NotFoundException when lecture not found', async () => {
            mockLectureService.deleteLecture.mockRejectedValue(
                new NotFoundException('Không tìm thấy bài giảng với ID 999'),
            )

            await expect(
                controller.deleteLecture({ id: 999 } as GetIdParamDto),
            ).rejects.toThrow(NotFoundException)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockLectureService.deleteLecture.mockRejectedValue(error)

            await expect(controller.deleteLecture(validParam)).rejects.toThrow(error)
        })
    })
})
