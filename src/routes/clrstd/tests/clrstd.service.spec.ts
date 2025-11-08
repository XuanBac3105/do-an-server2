import { Test, TestingModule } from '@nestjs/testing'
import { ClrstdService } from '../services/clrstd.service'
import { SharedClrStdRepo } from 'src/shared/repos/shared-clrstd.repo'
import { SharedJreqRepo } from 'src/shared/repos/shared-join-req.repo'
import { UpdateClrStdType } from '../dtos/requests/update-clrstd.dto'

describe('ClrstdService', () => {
    let service: ClrstdService
    let sharedClrStdRepo: SharedClrStdRepo
    let sharedJreqRepo: SharedJreqRepo

    const mockSharedClrStdRepo = {
        update: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
    }

    const mockSharedJreqRepo = {
        deleteJreq: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClrstdService,
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

        service = module.get<ClrstdService>(ClrstdService)
        sharedClrStdRepo = module.get<SharedClrStdRepo>(SharedClrStdRepo)
        sharedJreqRepo = module.get<SharedJreqRepo>(SharedJreqRepo)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('deactivate', () => {
        const validBody: UpdateClrStdType = {
            classroomId: 1,
            studentId: 100,
        }

        it('should deactivate student successfully', async () => {
            mockSharedClrStdRepo.update.mockResolvedValue(undefined)
            mockSharedJreqRepo.deleteJreq.mockResolvedValue(undefined)

            const result = await service.deactivate(validBody)

            expect(sharedClrStdRepo.update).toHaveBeenCalledWith({
                classroomId: validBody.classroomId,
                studentId: validBody.studentId,
                isActive: false,
            })
            expect(sharedClrStdRepo.update).toHaveBeenCalledTimes(1)

            expect(sharedJreqRepo.deleteJreq).toHaveBeenCalledWith(
                validBody.classroomId,
                validBody.studentId
            )
            expect(sharedJreqRepo.deleteJreq).toHaveBeenCalledTimes(1)

            expect(result).toEqual({
                message: 'Học sinh đã bị chặn truy cập vào lớp học',
            })
        })

        it('should handle deactivation with different student IDs', async () => {
            const body: UpdateClrStdType = {
                classroomId: 5,
                studentId: 200,
            }

            mockSharedClrStdRepo.update.mockResolvedValue(undefined)
            mockSharedJreqRepo.deleteJreq.mockResolvedValue(undefined)

            const result = await service.deactivate(body)

            expect(sharedClrStdRepo.update).toHaveBeenCalledWith({
                classroomId: 5,
                studentId: 200,
                isActive: false,
            })

            expect(sharedJreqRepo.deleteJreq).toHaveBeenCalledWith(5, 200)

            expect(result).toEqual({
                message: 'Học sinh đã bị chặn truy cập vào lớp học',
            })
        })

        it('should propagate errors from sharedClrStdRepo', async () => {
            const error = new Error('Database error')
            mockSharedClrStdRepo.update.mockRejectedValue(error)

            await expect(service.deactivate(validBody)).rejects.toThrow(
                'Database error'
            )

            expect(sharedClrStdRepo.update).toHaveBeenCalledTimes(1)
            expect(sharedJreqRepo.deleteJreq).not.toHaveBeenCalled()
        })

        it('should propagate errors from sharedJreqRepo', async () => {
            const error = new Error('Join request deletion error')
            mockSharedClrStdRepo.update.mockResolvedValue(undefined)
            mockSharedJreqRepo.deleteJreq.mockRejectedValue(error)

            await expect(service.deactivate(validBody)).rejects.toThrow(
                'Join request deletion error'
            )

            expect(sharedClrStdRepo.update).toHaveBeenCalledTimes(1)
            expect(sharedJreqRepo.deleteJreq).toHaveBeenCalledTimes(1)
        })
    })

    describe('activate', () => {
        const validBody: UpdateClrStdType = {
            classroomId: 1,
            studentId: 100,
        }

        it('should activate student successfully', async () => {
            mockSharedClrStdRepo.update.mockResolvedValue(undefined)

            const result = await service.activate(validBody)

            expect(sharedClrStdRepo.update).toHaveBeenCalledWith({
                classroomId: validBody.classroomId,
                studentId: validBody.studentId,
                isActive: true,
            })
            expect(sharedClrStdRepo.update).toHaveBeenCalledTimes(1)

            expect(result).toEqual({
                message: 'Đã bỏ chặn học sinh',
            })
        })

        it('should activate student with different IDs', async () => {
            const body: UpdateClrStdType = {
                classroomId: 10,
                studentId: 500,
            }

            mockSharedClrStdRepo.update.mockResolvedValue(undefined)

            const result = await service.activate(body)

            expect(sharedClrStdRepo.update).toHaveBeenCalledWith({
                classroomId: 10,
                studentId: 500,
                isActive: true,
            })

            expect(result).toEqual({
                message: 'Đã bỏ chặn học sinh',
            })
        })

        it('should not call deleteJreq when activating', async () => {
            mockSharedClrStdRepo.update.mockResolvedValue(undefined)

            await service.activate(validBody)

            expect(sharedJreqRepo.deleteJreq).not.toHaveBeenCalled()
        })

        it('should propagate errors from repository', async () => {
            const error = new Error('Database error')
            mockSharedClrStdRepo.update.mockRejectedValue(error)

            await expect(service.activate(validBody)).rejects.toThrow(
                'Database error'
            )

            expect(sharedClrStdRepo.update).toHaveBeenCalledTimes(1)
        })
    })

    describe('deleteStudent', () => {
        const validBody: UpdateClrStdType = {
            classroomId: 1,
            studentId: 100,
        }

        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should delete student successfully', async () => {
            const mockDate = new Date('2025-11-08T10:00:00.000Z')
            jest.setSystemTime(mockDate)

            mockSharedClrStdRepo.update.mockResolvedValue(undefined)
            mockSharedJreqRepo.deleteJreq.mockResolvedValue(undefined)

            const result = await service.deleteStudent(validBody)

            expect(sharedClrStdRepo.update).toHaveBeenCalledWith({
                classroomId: validBody.classroomId,
                studentId: validBody.studentId,
                deletedAt: mockDate,
            })
            expect(sharedClrStdRepo.update).toHaveBeenCalledTimes(1)

            expect(sharedJreqRepo.deleteJreq).toHaveBeenCalledWith(
                validBody.classroomId,
                validBody.studentId
            )
            expect(sharedJreqRepo.deleteJreq).toHaveBeenCalledTimes(1)

            expect(result).toEqual({
                message: 'Học sinh đã bị xóa khỏi lớp học',
            })
        })

        it('should delete student with different IDs', async () => {
            const body: UpdateClrStdType = {
                classroomId: 3,
                studentId: 300,
            }
            const mockDate = new Date('2025-11-08T15:30:00.000Z')
            jest.setSystemTime(mockDate)

            mockSharedClrStdRepo.update.mockResolvedValue(undefined)
            mockSharedJreqRepo.deleteJreq.mockResolvedValue(undefined)

            const result = await service.deleteStudent(body)

            expect(sharedClrStdRepo.update).toHaveBeenCalledWith({
                classroomId: 3,
                studentId: 300,
                deletedAt: mockDate,
            })

            expect(sharedJreqRepo.deleteJreq).toHaveBeenCalledWith(3, 300)

            expect(result).toEqual({
                message: 'Học sinh đã bị xóa khỏi lớp học',
            })
        })

        it('should use current date when deleting', async () => {
            const mockDate = new Date('2025-12-25T00:00:00.000Z')
            jest.setSystemTime(mockDate)

            mockSharedClrStdRepo.update.mockResolvedValue(undefined)
            mockSharedJreqRepo.deleteJreq.mockResolvedValue(undefined)

            await service.deleteStudent(validBody)

            const updateCall = mockSharedClrStdRepo.update.mock.calls[0][0]
            expect(updateCall.deletedAt).toEqual(mockDate)
        })

        it('should propagate errors from sharedClrStdRepo', async () => {
            const error = new Error('Database error')
            mockSharedClrStdRepo.update.mockRejectedValue(error)

            await expect(service.deleteStudent(validBody)).rejects.toThrow(
                'Database error'
            )

            expect(sharedClrStdRepo.update).toHaveBeenCalledTimes(1)
            expect(sharedJreqRepo.deleteJreq).not.toHaveBeenCalled()
        })

        it('should propagate errors from sharedJreqRepo', async () => {
            const error = new Error('Join request deletion error')
            mockSharedClrStdRepo.update.mockResolvedValue(undefined)
            mockSharedJreqRepo.deleteJreq.mockRejectedValue(error)

            await expect(service.deleteStudent(validBody)).rejects.toThrow(
                'Join request deletion error'
            )

            expect(sharedClrStdRepo.update).toHaveBeenCalledTimes(1)
            expect(sharedJreqRepo.deleteJreq).toHaveBeenCalledTimes(1)
        })
    })
})
