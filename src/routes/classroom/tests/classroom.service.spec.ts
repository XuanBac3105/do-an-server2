import { Test, TestingModule } from '@nestjs/testing'
import { ClassroomService } from '../services/classroom.service'
import { IClassroomRepo } from '../repos/classroom.interface.repo'
import { SharedClassroomRepo } from 'src/shared/repos/shared-classroom.repo'
import { UnprocessableEntityException } from '@nestjs/common'
import { GetClassroomsQueryType, ClassroomSortByEnum } from '../dtos/queries/get-classrooms.dto'
import { EnumOrder } from 'src/shared/constants/enum-order.constant'

describe('ClassroomService', () => {
    let service: ClassroomService
    let classroomRepo: IClassroomRepo
    let sharedClassroomRepo: SharedClassroomRepo

    const mockClassroomRepo = {
        count: jest.fn(),
        findMany: jest.fn(),
        findClassroomWithStdJreq: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    }

    const mockSharedClassroomRepo = {
        findUnique: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClassroomService,
                {
                    provide: 'IClassroomRepo',
                    useValue: mockClassroomRepo,
                },
                {
                    provide: SharedClassroomRepo,
                    useValue: mockSharedClassroomRepo,
                },
            ],
        }).compile()

        service = module.get<ClassroomService>(ClassroomService)
        classroomRepo = module.get<IClassroomRepo>('IClassroomRepo')
        sharedClassroomRepo = module.get<SharedClassroomRepo>(SharedClassroomRepo)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('getAllClassrooms', () => {
        const query: GetClassroomsQueryType = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: ClassroomSortByEnum.CREATED_AT,
        }

        const mockClassrooms = [
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
        ]

        it('should get all classrooms with pagination', async () => {
            mockClassroomRepo.count.mockResolvedValue(2)
            mockClassroomRepo.findMany.mockResolvedValue(mockClassrooms)

            const result = await service.getAllClassrooms(query)

            expect(classroomRepo.count).toHaveBeenCalledWith({
                deletedAt: null,
            })
            expect(classroomRepo.findMany).toHaveBeenCalledWith(
                { deletedAt: null },
                { createdAt: 'asc' },
                0,
                10,
            )
            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 2,
                data: mockClassrooms,
            })
        })

        it('should filter classrooms by isArchived status', async () => {
            const queryWithFilter = {
                ...query,
                isArchived: true,
            }

            mockClassroomRepo.count.mockResolvedValue(1)
            mockClassroomRepo.findMany.mockResolvedValue([mockClassrooms[0]])

            await service.getAllClassrooms(queryWithFilter)

            expect(classroomRepo.count).toHaveBeenCalledWith({
                deletedAt: null,
                isArchived: true,
            })
            expect(classroomRepo.findMany).toHaveBeenCalledWith(
                { deletedAt: null, isArchived: true },
                { createdAt: 'asc' },
                0,
                10,
            )
        })

        it('should search classrooms by name or description', async () => {
            const queryWithSearch = {
                ...query,
                search: 'Test',
            }

            const expectedWhereClause = {
                deletedAt: null,
                OR: [
                    { name: { contains: 'Test', mode: 'insensitive' } },
                    { description: { contains: 'Test', mode: 'insensitive' } },
                ],
            }

            mockClassroomRepo.count.mockResolvedValue(1)
            mockClassroomRepo.findMany.mockResolvedValue([mockClassrooms[0]])

            await service.getAllClassrooms(queryWithSearch)

            expect(classroomRepo.count).toHaveBeenCalledWith(expectedWhereClause)
            expect(classroomRepo.findMany).toHaveBeenCalledWith(
                expectedWhereClause,
                { createdAt: 'asc' },
                0,
                10,
            )
        })

        it('should sort classrooms by name', async () => {
            const queryWithSort = {
                ...query,
                sortBy: ClassroomSortByEnum.NAME,
                order: EnumOrder.DESC,
            }

            mockClassroomRepo.count.mockResolvedValue(2)
            mockClassroomRepo.findMany.mockResolvedValue(mockClassrooms)

            await service.getAllClassrooms(queryWithSort)

            expect(classroomRepo.findMany).toHaveBeenCalledWith(
                { deletedAt: null },
                { name: 'desc' },
                0,
                10,
            )
        })

        it('should handle pagination correctly', async () => {
            const queryPage2 = {
                ...query,
                page: 2,
                limit: 5,
            }

            mockClassroomRepo.count.mockResolvedValue(10)
            mockClassroomRepo.findMany.mockResolvedValue(mockClassrooms)

            await service.getAllClassrooms(queryPage2)

            expect(classroomRepo.findMany).toHaveBeenCalledWith(
                { deletedAt: null },
                { createdAt: 'asc' },
                5, // skip = (page - 1) * limit = (2 - 1) * 5
                5, // take = limit
            )
        })

        it('should combine filters, search, and sorting', async () => {
            const complexQuery = {
                ...query,
                isArchived: false,
                search: 'test',
                sortBy: ClassroomSortByEnum.NAME,
                order: EnumOrder.DESC,
            }

            const expectedWhereClause = {
                deletedAt: null,
                isArchived: false,
                OR: [
                    { name: { contains: 'test', mode: 'insensitive' } },
                    { description: { contains: 'test', mode: 'insensitive' } },
                ],
            }

            mockClassroomRepo.count.mockResolvedValue(1)
            mockClassroomRepo.findMany.mockResolvedValue([mockClassrooms[0]])

            await service.getAllClassrooms(complexQuery)

            expect(classroomRepo.count).toHaveBeenCalledWith(expectedWhereClause)
            expect(classroomRepo.findMany).toHaveBeenCalledWith(
                expectedWhereClause,
                { name: 'desc' },
                0,
                10,
            )
        })

        it('should return empty list when no classrooms found', async () => {
            mockClassroomRepo.count.mockResolvedValue(0)
            mockClassroomRepo.findMany.mockResolvedValue([])

            const result = await service.getAllClassrooms(query)

            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            })
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Database error')
            mockClassroomRepo.count.mockRejectedValue(error)

            await expect(service.getAllClassrooms(query)).rejects.toThrow(error)
        })
    })

    describe('getClassroomById', () => {
        const classroomId = 1

        const mockClassroom = {
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
            mockClassroomRepo.findClassroomWithStdJreq.mockResolvedValue(mockClassroom)

            const result = await service.getClassroomById(classroomId)

            expect(classroomRepo.findClassroomWithStdJreq).toHaveBeenCalledWith(classroomId)
            expect(result).toEqual(mockClassroom)
        })

        it('should throw error when classroom not found', async () => {
            mockClassroomRepo.findClassroomWithStdJreq.mockResolvedValue(null)

            await expect(service.getClassroomById(classroomId)).rejects.toThrow(
                new UnprocessableEntityException('Lớp học không tồn tại'),
            )
            expect(classroomRepo.findClassroomWithStdJreq).toHaveBeenCalledWith(classroomId)
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Database error')
            mockClassroomRepo.findClassroomWithStdJreq.mockRejectedValue(error)

            await expect(service.getClassroomById(classroomId)).rejects.toThrow(error)
        })
    })

    describe('createClassroom', () => {
        const createData = {
            name: 'New Classroom',
            description: 'New Description',
        }

        const mockClassroom = {
            id: 1,
            name: 'New Classroom',
            description: 'New Description',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should create classroom successfully', async () => {
            mockSharedClassroomRepo.findUnique.mockResolvedValue(null)
            mockClassroomRepo.create.mockResolvedValue(mockClassroom)

            const result = await service.createClassroom(createData)

            expect(sharedClassroomRepo.findUnique).toHaveBeenCalledWith({ name: createData.name })
            expect(classroomRepo.create).toHaveBeenCalledWith(createData)
            expect(result).toEqual(mockClassroom)
        })

        it('should throw error when classroom name already exists', async () => {
            mockSharedClassroomRepo.findUnique.mockResolvedValue(mockClassroom)

            await expect(service.createClassroom(createData)).rejects.toThrow(
                new UnprocessableEntityException('Tên lớp học đã tồn tại'),
            )
            expect(classroomRepo.create).not.toHaveBeenCalled()
        })

        it('should propagate errors from repository', async () => {
            mockSharedClassroomRepo.findUnique.mockResolvedValue(null)

            const error = new Error('Database error')
            mockClassroomRepo.create.mockRejectedValue(error)

            await expect(service.createClassroom(createData)).rejects.toThrow(error)
        })
    })

    describe('updateClassroom', () => {
        const classroomId = 1

        const updateData = {
            name: 'Updated Classroom',
            description: 'Updated Description',
        }

        const mockClassroom = {
            id: 1,
            name: 'Classroom 1',
            description: 'Description 1',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        const updatedClassroom = {
            ...mockClassroom,
            ...updateData,
        }

        it('should update classroom successfully', async () => {
            mockSharedClassroomRepo.findUnique
                .mockResolvedValueOnce(mockClassroom)
                .mockResolvedValueOnce(null)
            mockClassroomRepo.update.mockResolvedValue(updatedClassroom)

            const result = await service.updateClassroom(classroomId, updateData)

            expect(sharedClassroomRepo.findUnique).toHaveBeenCalledWith({ id: classroomId })
            expect(sharedClassroomRepo.findUnique).toHaveBeenCalledWith({ name: updateData.name })
            expect(classroomRepo.update).toHaveBeenCalledWith({
                id: classroomId,
                ...updateData,
            })
            expect(result).toEqual(updatedClassroom)
        })

        it('should throw error when classroom not found', async () => {
            mockSharedClassroomRepo.findUnique.mockResolvedValue(null)

            await expect(service.updateClassroom(classroomId, updateData)).rejects.toThrow(
                new UnprocessableEntityException('Lớp học không tồn tại'),
            )
            expect(classroomRepo.update).not.toHaveBeenCalled()
        })

        it('should throw error when classroom is deleted', async () => {
            const deletedClassroom = {
                ...mockClassroom,
                deletedAt: new Date(),
            }

            mockSharedClassroomRepo.findUnique.mockResolvedValue(deletedClassroom)

            await expect(service.updateClassroom(classroomId, updateData)).rejects.toThrow(
                new UnprocessableEntityException('Lớp học không tồn tại'),
            )
            expect(classroomRepo.update).not.toHaveBeenCalled()
        })

        it('should throw error when name already exists for another classroom', async () => {
            const existingClassroom = {
                ...mockClassroom,
                id: 2,
                name: 'Updated Classroom',
            }

            mockSharedClassroomRepo.findUnique
                .mockResolvedValueOnce(mockClassroom)
                .mockResolvedValueOnce(existingClassroom)

            await expect(service.updateClassroom(classroomId, updateData)).rejects.toThrow(
                new UnprocessableEntityException('Tên lớp học đã tồn tại'),
            )
            expect(classroomRepo.update).not.toHaveBeenCalled()
        })

        it('should allow updating with same name', async () => {
            const sameNameData = {
                name: 'Classroom 1',
                description: 'Updated Description',
            }

            mockSharedClassroomRepo.findUnique
                .mockResolvedValueOnce(mockClassroom)
                .mockResolvedValueOnce(mockClassroom)
            mockClassroomRepo.update.mockResolvedValue({
                ...mockClassroom,
                description: sameNameData.description,
            })

            const result = await service.updateClassroom(classroomId, sameNameData)

            expect(classroomRepo.update).toHaveBeenCalled()
            expect(result.description).toBe(sameNameData.description)
        })

        it('should propagate errors from repository', async () => {
            mockSharedClassroomRepo.findUnique
                .mockResolvedValueOnce(mockClassroom)
                .mockResolvedValueOnce(null)

            const error = new Error('Database error')
            mockClassroomRepo.update.mockRejectedValue(error)

            await expect(service.updateClassroom(classroomId, updateData)).rejects.toThrow(error)
        })
    })

    describe('deleteClassroom', () => {
        const classroomId = 1

        const mockClassroom = {
            id: 1,
            name: 'Classroom 1',
            description: 'Description 1',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }

        it('should delete classroom successfully', async () => {
            mockSharedClassroomRepo.findUnique.mockResolvedValue(mockClassroom)
            mockClassroomRepo.update.mockResolvedValue({
                ...mockClassroom,
                deletedAt: new Date(),
            })

            const result = await service.deleteClassroom(classroomId)

            expect(sharedClassroomRepo.findUnique).toHaveBeenCalledWith({ id: classroomId })
            expect(classroomRepo.update).toHaveBeenCalledWith({
                id: classroomId,
                deletedAt: expect.any(Date),
            })
            expect(result).toEqual({ message: 'Xóa lớp học thành công' })
        })

        it('should throw error when classroom not found', async () => {
            mockSharedClassroomRepo.findUnique.mockResolvedValue(null)

            await expect(service.deleteClassroom(classroomId)).rejects.toThrow(
                new UnprocessableEntityException('Lớp học không tồn tại'),
            )
            expect(classroomRepo.update).not.toHaveBeenCalled()
        })

        it('should propagate errors from repository', async () => {
            mockSharedClassroomRepo.findUnique.mockResolvedValue(mockClassroom)

            const error = new Error('Database error')
            mockClassroomRepo.update.mockRejectedValue(error)

            await expect(service.deleteClassroom(classroomId)).rejects.toThrow(error)
        })
    })

    describe('getDeletedClassrooms', () => {
        const query: GetClassroomsQueryType = {
            page: 1,
            limit: 10,
            order: EnumOrder.ASC,
            sortBy: ClassroomSortByEnum.CREATED_AT,
        }

        const mockDeletedClassrooms = [
            {
                id: 1,
                name: 'Deleted Classroom 1',
                description: 'Description 1',
                isArchived: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: new Date(),
            },
        ]

        it('should get all deleted classrooms with pagination', async () => {
            mockClassroomRepo.count.mockResolvedValue(1)
            mockClassroomRepo.findMany.mockResolvedValue(mockDeletedClassrooms)

            const result = await service.getDeletedClassrooms(query)

            expect(classroomRepo.count).toHaveBeenCalledWith({
                deletedAt: { not: null },
            })
            expect(classroomRepo.findMany).toHaveBeenCalledWith(
                { deletedAt: { not: null } },
                { createdAt: 'asc' },
                0,
                10,
            )
            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 1,
                data: mockDeletedClassrooms,
            })
        })

        it('should search deleted classrooms by name or description', async () => {
            const queryWithSearch = {
                ...query,
                search: 'Test',
            }

            const expectedWhereClause = {
                deletedAt: { not: null },
                OR: [
                    { name: { contains: 'Test', mode: 'insensitive' } },
                    { description: { contains: 'Test', mode: 'insensitive' } },
                ],
            }

            mockClassroomRepo.count.mockResolvedValue(1)
            mockClassroomRepo.findMany.mockResolvedValue(mockDeletedClassrooms)

            await service.getDeletedClassrooms(queryWithSearch)

            expect(classroomRepo.count).toHaveBeenCalledWith(expectedWhereClause)
            expect(classroomRepo.findMany).toHaveBeenCalledWith(
                expectedWhereClause,
                { createdAt: 'asc' },
                0,
                10,
            )
        })

        it('should return empty list when no deleted classrooms found', async () => {
            mockClassroomRepo.count.mockResolvedValue(0)
            mockClassroomRepo.findMany.mockResolvedValue([])

            const result = await service.getDeletedClassrooms(query)

            expect(result).toEqual({
                page: 1,
                limit: 10,
                total: 0,
                data: [],
            })
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Database error')
            mockClassroomRepo.count.mockRejectedValue(error)

            await expect(service.getDeletedClassrooms(query)).rejects.toThrow(error)
        })
    })

    describe('restoreClassroom', () => {
        const classroomId = 1

        const mockDeletedClassroom = {
            id: 1,
            name: 'Deleted Classroom',
            description: 'Description',
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: new Date(),
        }

        const restoredClassroom = {
            ...mockDeletedClassroom,
            deletedAt: null,
        }

        it('should restore classroom successfully', async () => {
            mockSharedClassroomRepo.findUnique.mockResolvedValue(mockDeletedClassroom)
            mockClassroomRepo.update.mockResolvedValue(restoredClassroom)

            const result = await service.restoreClassroom(classroomId)

            expect(sharedClassroomRepo.findUnique).toHaveBeenCalledWith({ id: classroomId })
            expect(classroomRepo.update).toHaveBeenCalledWith({
                id: classroomId,
                deletedAt: null,
            })
            expect(result).toEqual(restoredClassroom)
        })

        it('should throw error when classroom not found', async () => {
            mockSharedClassroomRepo.findUnique.mockResolvedValue(null)

            await expect(service.restoreClassroom(classroomId)).rejects.toThrow(
                new UnprocessableEntityException('Lớp học không tồn tại'),
            )
            expect(classroomRepo.update).not.toHaveBeenCalled()
        })

        it('should throw error when classroom is not deleted', async () => {
            const activeClassroom = {
                ...mockDeletedClassroom,
                deletedAt: null,
            }

            mockSharedClassroomRepo.findUnique.mockResolvedValue(activeClassroom)

            await expect(service.restoreClassroom(classroomId)).rejects.toThrow(
                new UnprocessableEntityException('Lớp học không tồn tại'),
            )
            expect(classroomRepo.update).not.toHaveBeenCalled()
        })

        it('should propagate errors from repository', async () => {
            mockSharedClassroomRepo.findUnique.mockResolvedValue(mockDeletedClassroom)

            const error = new Error('Database error')
            mockClassroomRepo.update.mockRejectedValue(error)

            await expect(service.restoreClassroom(classroomId)).rejects.toThrow(error)
        })
    })
})
