import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { JoinRequestStatus, Prisma } from '@prisma/client'
import { SharedClassroomRepo } from 'src/shared/repos/shared-classroom.repo'
import { SharedClrStdRepo } from 'src/shared/repos/shared-clrstd.repo'
import { SharedJreqRepo } from 'src/shared/repos/shared-join-req.repo'
import { GetJoinreqClassroomsQueryType } from '../dtos/queries/get-joinreq-classrooms.dto'
import {
    JoinreqClassroomListResType,
    JoinedClassroomListResType,
} from '../dtos/responses/joinreq-classroom-list-res.dto'
import { buildListResponse, calculatePagination } from 'src/shared/utils/query.util'
import { CreateJoinreqReqType } from '../dtos/requests/create-joinreq.dto'
import { JoinreqResType } from '../dtos/responses/joinreq-res.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import type { IJoinreqRepo } from '../repos/joinreq.interface.repo'
import { IJoinreqService } from './joinreq.interface.service'

@Injectable()
export class JoinreqService implements IJoinreqService {
    constructor(
        @Inject('IJoinreqRepo')
        private readonly joinreqRepo: IJoinreqRepo,
        private readonly sharedClassroomRepo: SharedClassroomRepo,
        private readonly sharedClrStdRepo: SharedClrStdRepo,
        private readonly sharedJreqRepo: SharedJreqRepo,
    ) { }

    async createJoinRequest(id: number, body: CreateJoinreqReqType): Promise<JoinreqResType> {
        const existingRequest = await this.joinreqRepo.findUnique({ studentId: id, classroomId: body.classroomId })
        if (existingRequest) {
            if (existingRequest.status !== JoinRequestStatus.rejected) {
                throw new UnprocessableEntityException('Yêu cầu tham gia đã tồn tại')
            } else {
                return await this.joinreqRepo.update({
                    id: existingRequest.id,
                    status: JoinRequestStatus.pending,
                    requestedAt: new Date(),
                    handledAt: null,
                })
            }
        }
        const classroomExists = await this.sharedClassroomRepo.findUnique({ id: body.classroomId })
        if (!classroomExists || classroomExists.deletedAt) {
            throw new UnprocessableEntityException('Lớp học không tồn tại')
        }
        if (classroomExists.isArchived) {
            throw new UnprocessableEntityException('Không thể tham gia lớp học đã lưu trữ')
        }
        return this.joinreqRepo.createJoinRequest(id, body.classroomId)
    }

    async approveJoinRequest(id: number): Promise<JoinreqResType> {
        const joinRequest = await this.joinreqRepo.findById(id)
        if (!joinRequest) {
            throw new UnprocessableEntityException('Yêu cầu tham gia không tồn tại')
        } else if (joinRequest.status === JoinRequestStatus.approved) {
            throw new UnprocessableEntityException('Yêu cầu tham gia đã được chấp thuận từ trước')
        }
        const updatedRequest = await this.joinreqRepo.update({
            id: joinRequest.id,
            status: JoinRequestStatus.approved,
            handledAt: new Date(),
        })
        const classroomStudent = await this.sharedClrStdRepo.findUnique({
            classroomId: joinRequest.classroomId,
            studentId: joinRequest.studentId,
        })
        if (classroomStudent && classroomStudent.deletedAt !== null) {
            await this.sharedClrStdRepo.update({
                classroomId: joinRequest.classroomId,
                studentId: joinRequest.studentId,
                deletedAt: null,
            })
        } else {
            await this.sharedClrStdRepo.create({
                classroomId: joinRequest.classroomId,
                studentId: joinRequest.studentId,
            })
        }
        return updatedRequest
    }

    async rejectJoinRequest(id: number): Promise<JoinreqResType> {
        const joinRequest = await this.joinreqRepo.findById(id)
        if (!joinRequest) {
            throw new UnprocessableEntityException('Yêu cầu tham gia không tồn tại')
        } else if (joinRequest.status === JoinRequestStatus.rejected) {
            throw new UnprocessableEntityException('Yêu cầu tham gia đã bị từ chối trước đó')
        } else if (joinRequest.status === JoinRequestStatus.approved) {
            throw new UnprocessableEntityException('Yêu cầu tham gia đã được chấp thuận từ trước. Không thể từ chối')
        }
        return this.joinreqRepo.update({
            id: joinRequest.id,
            status: JoinRequestStatus.rejected,
            handledAt: new Date(),
        })
    }

    async studentViewClassrooms(
        studentId: number,
        query: GetJoinreqClassroomsQueryType,
    ): Promise<JoinreqClassroomListResType> {
        const { page, limit, order, search, sortBy } = query

        const { skip, take } = calculatePagination(page, limit)

        const where: Prisma.ClassroomWhereInput = {
            deletedAt: null,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        }

        const orderBy: Prisma.ClassroomOrderByWithRelationInput = {
            [sortBy]: order,
        }

        const [total, classrooms] = await Promise.all([
            this.joinreqRepo.countClassrooms(where),
            this.joinreqRepo.findClassrooms(where, orderBy, skip, take, {
                includeStudentInfo: true,
                studentId,
            }),
        ])

        const data = classrooms.map((classroom) => {
            const isJoined = classroom.classroomStudents.some((cs) => cs.deletedAt === null)
            const joinRequest = classroom.joinRequests.length > 0 ? classroom.joinRequests[0] : null

            return {
                id: classroom.id,
                name: classroom.name,
                description: classroom.description,
                coverMediaId: classroom.coverMediaId,
                isArchived: classroom.isArchived,
                createdAt: classroom.createdAt,
                updatedAt: classroom.updatedAt,
                isJoined,
                joinRequest:
                    !isJoined && joinRequest
                        ? {
                            id: joinRequest.id,
                            status: joinRequest.status,
                            requestedAt: joinRequest.requestedAt,
                            handledAt: joinRequest.handledAt,
                        }
                        : null,
            }
        })

        return buildListResponse(page, limit, total, data)
    }

    async studentViewJoinedClassrooms(
        studentId: number,
        query: GetJoinreqClassroomsQueryType,
    ): Promise<JoinedClassroomListResType> {
        const { page, limit, order, search, sortBy } = query

        const { skip, take } = calculatePagination(page, limit)

        const where: Prisma.ClassroomWhereInput = {
            deletedAt: null,
            classroomStudents: {
                some: {
                    studentId,
                    isActive: true,
                    deletedAt: null,
                },
            },
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        }

        const orderBy: Prisma.ClassroomOrderByWithRelationInput = {
            [sortBy]: order,
        }

        const [total, classrooms] = await Promise.all([
            this.joinreqRepo.countClassrooms(where),
            this.joinreqRepo.findClassrooms(where, orderBy, skip, take),
        ])

        const data = classrooms.map((classroom) => ({
            id: classroom.id,
            name: classroom.name,
            description: classroom.description,
            coverMediaId: classroom.coverMediaId,
            isArchived: classroom.isArchived,
            createdAt: classroom.createdAt,
            updatedAt: classroom.updatedAt,
        }))

        return buildListResponse(page, limit, total, data)
    }

    async leaveClassroom(studentId: number, classroomId: number): Promise<ResponseMessage> {
        await this.sharedClrStdRepo.update({ studentId, classroomId, deletedAt: new Date() })
        await this.sharedJreqRepo.deleteJreq(classroomId, studentId)
        return { message: 'Rời lớp học thành công' }
    }
}
