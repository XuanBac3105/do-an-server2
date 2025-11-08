import { Test, TestingModule } from '@nestjs/testing'
import { ClassroomController } from '../classroom.controller'
import { IClassroomService } from '../services/classroom.interface.service'
import { UnprocessableEntityException } from '@nestjs/common'
import { GetClassroomsQueryDto, ClassroomSortByEnum } from '../dtos/queries/get-classrooms.dto'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { EnumOrder } from 'src/shared/constants/enum-order.constant'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { CreateClassroomReqDto } from '../dtos/requests/create-classroom-req.dto'
import { UpdateClassroomReqDto } from '../dtos/requests/update-classroom-req.dto'

describe('ClassroomController', () => {
    let controller: ClassroomController
    let classroomService: IClassroomService

    const mockClassroomService = {
        getAllClassrooms: jest.fn(),
        getDeletedClassrooms: jest.fn(),
        getClassroomById: jest.fn(),
        createClassroom: jest.fn(),
        updateClassroom: jest.fn(),
        deleteClassroom: jest.fn(),
        restoreClassroom: jest.fn(),
    }

    const mockRoleGuard = {
        canActivate: jest.fn(() => true),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClassroomController],
            providers: [
                {
                    provide: 'IClassroomService',
                    useValue: mockClassroomService,
                },
            ],
        })
            .overrideGuard(RoleGuard)
            .useValue(mockRoleGuard)
            .compile()

        controller = module.get<ClassroomController>(ClassroomController)
        classroomService = module.get<IClassroomService>('IClassroomService')
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('getAllClassrooms', () => {
        const validQuery: GetClassroomsQueryDto = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: ClassroomSortByEnum.CREATED_AT,
        } as GetClassroomsQueryDto

        const expectedResponse = {
            page: 1,
            limit: 10,
            total: 2,
            data: [
                {
                    id: 1,
                    name: 'Classroom 1',
                    description: 'Description 1',
                    isArchived: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
                {
                    id: 2,
                    name: 'Classroom 2',
                    description: 'Description 2',
                    isArchived: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ],
        }

        it('should get all classrooms successfully', async () => {
            mockClassroomService.getAllClassrooms.mockResolvedValue(expectedResponse)

            const result = await controller.getAllClassrooms(validQuery)

            expect(classroomService.getAllClassrooms).toHaveBeenCalledWith(validQuery)
            expect(classroomService.getAllClassrooms).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should get classrooms with search filter', async () => {
            const queryWithSearch = {
                ...validQuery,
                search: 'Math',
            } as GetClassroomsQueryDto

            const searchResponse = {
                page: 1,
                limit: 10,
                total: 1,
                data: [
                    {
                        id: 1,
                        name: 'Math Class',
                        description: 'Mathematics classroom',
                        isArchived: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                    },
                ],
            }

            mockClassroomService.getAllClassrooms.mockResolvedValue(searchResponse)

            const result = await controller.getAllClassrooms(queryWithSearch)

            expect(classroomService.getAllClassrooms).toHaveBeenCalledWith(queryWithSearch)
            expect(result).toEqual(searchResponse)
        })

        it('should get classrooms filtered by isArchived status', async () => {
            const queryWithIsArchived = {
                ...validQuery,
                isArchived: true,
            } as GetClassroomsQueryDto

            mockClassroomService.getAllClassrooms.mockResolvedValue(expectedResponse)

            const result = await controller.getAllClassrooms(queryWithIsArchived)

            expect(classroomService.getAllClassrooms).toHaveBeenCalledWith(queryWithIsArchived)
            expect(result).toEqual(expectedResponse)
        })

        it('should get classrooms sorted by different fields', async () => {
            const queryWithSortBy = {
                ...validQuery,
                sortBy: ClassroomSortByEnum.NAME,
                order: EnumOrder.DESC,
            } as GetClassroomsQueryDto

            mockClassroomService.getAllClassrooms.mockResolvedValue(expectedResponse)

            const result = await controller.getAllClassrooms(queryWithSortBy)

            expect(classroomService.getAllClassrooms).toHaveBeenCalledWith(queryWithSortBy)
            expect(result).toEqual(expectedResponse)
        })

        it('should return empty data when no classrooms found', async () => {
            const emptyResponse = {
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            }

            mockClassroomService.getAllClassrooms.mockResolvedValue(emptyResponse)

            const result = await controller.getAllClassrooms(validQuery)

            expect(result).toEqual(emptyResponse)
            expect(result.data).toHaveLength(0)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockClassroomService.getAllClassrooms.mockRejectedValue(error)

            await expect(controller.getAllClassrooms(validQuery)).rejects.toThrow(error)
        })
    })

    describe('getDeletedClassrooms', () => {
        const validQuery: GetClassroomsQueryDto = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: ClassroomSortByEnum.CREATED_AT,
        } as GetClassroomsQueryDto

        const expectedResponse = {
            page: 1,
            limit: 10,
            total: 1,
            data: [
                {
                    id: 1,
                    name: 'Deleted Classroom',
                    description: 'Deleted Description',
                    isArchived: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: new Date(),
                },
            ],
        }

        it('should get all deleted classrooms successfully', async () => {
            mockClassroomService.getDeletedClassrooms.mockResolvedValue(expectedResponse)

            const result = await controller.getDeletedClassrooms(validQuery)

            expect(classroomService.getDeletedClassrooms).toHaveBeenCalledWith(validQuery)
            expect(classroomService.getDeletedClassrooms).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should return empty data when no deleted classrooms found', async () => {
            const emptyResponse = {
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            }

            mockClassroomService.getDeletedClassrooms.mockResolvedValue(emptyResponse)

            const result = await controller.getDeletedClassrooms(validQuery)

            expect(result).toEqual(emptyResponse)
            expect(result.data).toHaveLength(0)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockClassroomService.getDeletedClassrooms.mockRejectedValue(error)

            await expect(controller.getDeletedClassrooms(validQuery)).rejects.toThrow(error)
        })
    })

    describe('getClassroomById', () => {
        const validParam: GetIdParamDto = { id: 1 } as GetIdParamDto

        const expectedClassroom = {
            id: 1,
            name: 'Classroom 1',
            description: 'Description 1',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            joinRequests: [],
            classroomStudents: [],
        }

        it('should get classroom by id successfully', async () => {
            mockClassroomService.getClassroomById.mockResolvedValue(expectedClassroom)

            const result = await controller.getClassroomById(validParam)

            expect(classroomService.getClassroomById).toHaveBeenCalledWith(validParam.id)
            expect(classroomService.getClassroomById).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedClassroom)
        })

        it('should throw error when classroom not found', async () => {
            const error = new UnprocessableEntityException('Lớp học không tồn tại')
            mockClassroomService.getClassroomById.mockRejectedValue(error)

            await expect(controller.getClassroomById(validParam)).rejects.toThrow(error)
            expect(classroomService.getClassroomById).toHaveBeenCalledWith(validParam.id)
        })

        it('should get classroom with join requests and students', async () => {
            const classroomWithRelations = {
                ...expectedClassroom,
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
                        },
                    },
                ],
            }

            mockClassroomService.getClassroomById.mockResolvedValue(classroomWithRelations)

            const result = await controller.getClassroomById(validParam)

            expect(result.joinRequests).toHaveLength(1)
            expect(result.classroomStudents).toHaveLength(1)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockClassroomService.getClassroomById.mockRejectedValue(error)

            await expect(controller.getClassroomById(validParam)).rejects.toThrow(error)
        })
    })

    describe('createClassroom', () => {
        const validBody: CreateClassroomReqDto = {
            name: 'New Classroom',
            description: 'New Description',
        } as CreateClassroomReqDto

        const expectedClassroom = {
            id: 1,
            name: 'New Classroom',
            description: 'New Description',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should create classroom successfully', async () => {
            mockClassroomService.createClassroom.mockResolvedValue(expectedClassroom)

            const result = await controller.createClassroom(validBody)

            expect(classroomService.createClassroom).toHaveBeenCalledWith(validBody)
            expect(classroomService.createClassroom).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedClassroom)
        })

        it('should throw error when classroom name already exists', async () => {
            const error = new UnprocessableEntityException('Tên lớp học đã tồn tại')
            mockClassroomService.createClassroom.mockRejectedValue(error)

            await expect(controller.createClassroom(validBody)).rejects.toThrow(error)
            expect(classroomService.createClassroom).toHaveBeenCalledWith(validBody)
        })

        it('should create classroom with null description', async () => {
            const bodyWithNullDescription = {
                name: 'New Classroom',
                description: null,
            } as CreateClassroomReqDto

            const classroomWithNullDescription = {
                ...expectedClassroom,
                description: null,
            }

            mockClassroomService.createClassroom.mockResolvedValue(classroomWithNullDescription)

            const result = await controller.createClassroom(bodyWithNullDescription)

            expect(result.description).toBeNull()
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockClassroomService.createClassroom.mockRejectedValue(error)

            await expect(controller.createClassroom(validBody)).rejects.toThrow(error)
        })
    })

    describe('updateClassroom', () => {
        const validParam: GetIdParamDto = { id: 1 } as GetIdParamDto
        const validBody: UpdateClassroomReqDto = {
            name: 'Updated Classroom',
            description: 'Updated Description',
        } as UpdateClassroomReqDto

        const expectedClassroom = {
            id: 1,
            name: 'Updated Classroom',
            description: 'Updated Description',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should update classroom successfully', async () => {
            mockClassroomService.updateClassroom.mockResolvedValue(expectedClassroom)

            const result = await controller.updateClassroom(validParam, validBody)

            expect(classroomService.updateClassroom).toHaveBeenCalledWith(validParam.id, validBody)
            expect(classroomService.updateClassroom).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedClassroom)
        })

        it('should throw error when classroom not found', async () => {
            const error = new UnprocessableEntityException('Lớp học không tồn tại')
            mockClassroomService.updateClassroom.mockRejectedValue(error)

            await expect(controller.updateClassroom(validParam, validBody)).rejects.toThrow(error)
            expect(classroomService.updateClassroom).toHaveBeenCalledWith(validParam.id, validBody)
        })

        it('should throw error when classroom name already exists', async () => {
            const error = new UnprocessableEntityException('Tên lớp học đã tồn tại')
            mockClassroomService.updateClassroom.mockRejectedValue(error)

            await expect(controller.updateClassroom(validParam, validBody)).rejects.toThrow(error)
        })

        it('should update only specific fields', async () => {
            const partialBody = {
                name: 'Only Name Updated',
            } as UpdateClassroomReqDto

            const partialUpdateResult = {
                ...expectedClassroom,
                name: 'Only Name Updated',
            }

            mockClassroomService.updateClassroom.mockResolvedValue(partialUpdateResult)

            const result = await controller.updateClassroom(validParam, partialBody)

            expect(result.name).toBe('Only Name Updated')
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockClassroomService.updateClassroom.mockRejectedValue(error)

            await expect(controller.updateClassroom(validParam, validBody)).rejects.toThrow(error)
        })
    })

    describe('deleteClassroom', () => {
        const validParam: GetIdParamDto = { id: 1 } as GetIdParamDto

        const expectedResponse = {
            message: 'Xóa lớp học thành công',
        }

        it('should delete classroom successfully', async () => {
            mockClassroomService.deleteClassroom.mockResolvedValue(expectedResponse)

            const result = await controller.deleteClassroom(validParam)

            expect(classroomService.deleteClassroom).toHaveBeenCalledWith(validParam.id)
            expect(classroomService.deleteClassroom).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should throw error when classroom not found', async () => {
            const error = new UnprocessableEntityException('Lớp học không tồn tại')
            mockClassroomService.deleteClassroom.mockRejectedValue(error)

            await expect(controller.deleteClassroom(validParam)).rejects.toThrow(error)
            expect(classroomService.deleteClassroom).toHaveBeenCalledWith(validParam.id)
        })

        it('should handle multiple deletion attempts', async () => {
            mockClassroomService.deleteClassroom.mockResolvedValue(expectedResponse)

            await controller.deleteClassroom(validParam)
            await controller.deleteClassroom(validParam)

            expect(classroomService.deleteClassroom).toHaveBeenCalledTimes(2)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockClassroomService.deleteClassroom.mockRejectedValue(error)

            await expect(controller.deleteClassroom(validParam)).rejects.toThrow(error)
        })
    })

    describe('restoreClassroom', () => {
        const validParam: GetIdParamDto = { id: 1 } as GetIdParamDto

        const expectedClassroom = {
            id: 1,
            name: 'Restored Classroom',
            description: 'Restored Description',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should restore classroom successfully', async () => {
            mockClassroomService.restoreClassroom.mockResolvedValue(expectedClassroom)

            const result = await controller.restoreClassroom(validParam)

            expect(classroomService.restoreClassroom).toHaveBeenCalledWith(validParam.id)
            expect(classroomService.restoreClassroom).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedClassroom)
        })

        it('should throw error when classroom not found', async () => {
            const error = new UnprocessableEntityException('Lớp học không tồn tại')
            mockClassroomService.restoreClassroom.mockRejectedValue(error)

            await expect(controller.restoreClassroom(validParam)).rejects.toThrow(error)
            expect(classroomService.restoreClassroom).toHaveBeenCalledWith(validParam.id)
        })

        it('should throw error when classroom is not deleted', async () => {
            const error = new UnprocessableEntityException('Lớp học không tồn tại')
            mockClassroomService.restoreClassroom.mockRejectedValue(error)

            await expect(controller.restoreClassroom(validParam)).rejects.toThrow(error)
        })

        it('should handle multiple restoration attempts', async () => {
            mockClassroomService.restoreClassroom.mockResolvedValue(expectedClassroom)

            await controller.restoreClassroom(validParam)
            await controller.restoreClassroom(validParam)

            expect(classroomService.restoreClassroom).toHaveBeenCalledTimes(2)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Database error')
            mockClassroomService.restoreClassroom.mockRejectedValue(error)

            await expect(controller.restoreClassroom(validParam)).rejects.toThrow(error)
        })
    })
})
