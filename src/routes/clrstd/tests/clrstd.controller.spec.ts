import { Test, TestingModule } from '@nestjs/testing'
import { ClrstdController } from '../clrstd.controller'
import { IClrstdService } from '../services/clrstd.interface.service'
import { UpdateClrStdDto } from '../dtos/requests/update-clrstd.dto'
import { RoleGuard } from 'src/shared/guards/role.guard'

describe('ClrstdController', () => {
    let controller: ClrstdController
    let clrstdService: IClrstdService

    const mockClrstdService = {
        deactivate: jest.fn(),
        activate: jest.fn(),
        deleteStudent: jest.fn(),
    }

    const mockRoleGuard = {
        canActivate: jest.fn(() => true),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClrstdController],
            providers: [
                {
                    provide: 'IClrstdService',
                    useValue: mockClrstdService,
                },
            ],
        })
            .overrideGuard(RoleGuard)
            .useValue(mockRoleGuard)
            .compile()

        controller = module.get<ClrstdController>(ClrstdController)
        clrstdService = module.get<IClrstdService>('IClrstdService')
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('deactivate', () => {
        const validBody: UpdateClrStdDto = {
            classroomId: 1,
            studentId: 100,
        } as UpdateClrStdDto

        const expectedResponse = {
            message: 'Học sinh đã bị chặn truy cập vào lớp học',
        }

        it('should deactivate student successfully', async () => {
            mockClrstdService.deactivate.mockResolvedValue(expectedResponse)

            const result = await controller.deactivate(validBody)

            expect(clrstdService.deactivate).toHaveBeenCalledWith(validBody)
            expect(clrstdService.deactivate).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should handle deactivate with different IDs', async () => {
            const body: UpdateClrStdDto = {
                classroomId: 5,
                studentId: 200,
            } as UpdateClrStdDto

            mockClrstdService.deactivate.mockResolvedValue(expectedResponse)

            const result = await controller.deactivate(body)

            expect(clrstdService.deactivate).toHaveBeenCalledWith(body)
            expect(result).toEqual(expectedResponse)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Service error')
            mockClrstdService.deactivate.mockRejectedValue(error)

            await expect(controller.deactivate(validBody)).rejects.toThrow(
                'Service error'
            )

            expect(clrstdService.deactivate).toHaveBeenCalledTimes(1)
        })
    })

    describe('activate', () => {
        const validBody: UpdateClrStdDto = {
            classroomId: 1,
            studentId: 100,
        } as UpdateClrStdDto

        const expectedResponse = {
            message: 'Đã bỏ chặn học sinh',
        }

        it('should activate student successfully', async () => {
            mockClrstdService.activate.mockResolvedValue(expectedResponse)

            const result = await controller.activate(validBody)

            expect(clrstdService.activate).toHaveBeenCalledWith(validBody)
            expect(clrstdService.activate).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should handle activate with different IDs', async () => {
            const body: UpdateClrStdDto = {
                classroomId: 10,
                studentId: 500,
            } as UpdateClrStdDto

            mockClrstdService.activate.mockResolvedValue(expectedResponse)

            const result = await controller.activate(body)

            expect(clrstdService.activate).toHaveBeenCalledWith(body)
            expect(result).toEqual(expectedResponse)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Service error')
            mockClrstdService.activate.mockRejectedValue(error)

            await expect(controller.activate(validBody)).rejects.toThrow(
                'Service error'
            )

            expect(clrstdService.activate).toHaveBeenCalledTimes(1)
        })
    })

    describe('deleteStudent', () => {
        const validBody: UpdateClrStdDto = {
            classroomId: 1,
            studentId: 100,
        } as UpdateClrStdDto

        const expectedResponse = {
            message: 'Học sinh đã bị xóa khỏi lớp học',
        }

        it('should delete student successfully', async () => {
            mockClrstdService.deleteStudent.mockResolvedValue(expectedResponse)

            const result = await controller.deleteStudent(validBody)

            expect(clrstdService.deleteStudent).toHaveBeenCalledWith(validBody)
            expect(clrstdService.deleteStudent).toHaveBeenCalledTimes(1)
            expect(result).toEqual(expectedResponse)
        })

        it('should handle delete with different IDs', async () => {
            const body: UpdateClrStdDto = {
                classroomId: 3,
                studentId: 300,
            } as UpdateClrStdDto

            mockClrstdService.deleteStudent.mockResolvedValue(expectedResponse)

            const result = await controller.deleteStudent(body)

            expect(clrstdService.deleteStudent).toHaveBeenCalledWith(body)
            expect(result).toEqual(expectedResponse)
        })

        it('should propagate errors from service', async () => {
            const error = new Error('Service error')
            mockClrstdService.deleteStudent.mockRejectedValue(error)

            await expect(controller.deleteStudent(validBody)).rejects.toThrow(
                'Service error'
            )

            expect(clrstdService.deleteStudent).toHaveBeenCalledTimes(1)
        })
    })

    describe('Integration scenarios', () => {
        it('should handle multiple operations on same student', async () => {
            const body: UpdateClrStdDto = {
                classroomId: 1,
                studentId: 100,
            } as UpdateClrStdDto

            // First deactivate
            mockClrstdService.deactivate.mockResolvedValue({
                message: 'Học sinh đã bị chặn truy cập vào lớp học',
            })
            await controller.deactivate(body)
            expect(clrstdService.deactivate).toHaveBeenCalledTimes(1)

            // Then activate
            mockClrstdService.activate.mockResolvedValue({
                message: 'Đã bỏ chặn học sinh',
            })
            await controller.activate(body)
            expect(clrstdService.activate).toHaveBeenCalledTimes(1)

            // Finally delete
            mockClrstdService.deleteStudent.mockResolvedValue({
                message: 'Học sinh đã bị xóa khỏi lớp học',
            })
            await controller.deleteStudent(body)
            expect(clrstdService.deleteStudent).toHaveBeenCalledTimes(1)
        })

        it('should handle operations on different students', async () => {
            const body1: UpdateClrStdDto = {
                classroomId: 1,
                studentId: 100,
            } as UpdateClrStdDto

            const body2: UpdateClrStdDto = {
                classroomId: 1,
                studentId: 200,
            } as UpdateClrStdDto

            mockClrstdService.deactivate.mockResolvedValue({
                message: 'Học sinh đã bị chặn truy cập vào lớp học',
            })

            await controller.deactivate(body1)
            await controller.deactivate(body2)

            expect(clrstdService.deactivate).toHaveBeenCalledTimes(2)
            expect(clrstdService.deactivate).toHaveBeenNthCalledWith(1, body1)
            expect(clrstdService.deactivate).toHaveBeenNthCalledWith(2, body2)
        })
    })
})
