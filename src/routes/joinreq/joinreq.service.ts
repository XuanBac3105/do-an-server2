import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JoinreqRepo } from './joinreq.repo';
import { CreateJoinreqReqDto } from './joinreq.dto';
import { JoinRequest, JoinRequestStatus } from '@prisma/client';
import { SharedClassroomRepo } from 'src/shared/repos/shared-classroom.repo';
import { SharedClrStdRepo } from 'src/shared/repos/shared-clrstd.repo';
import { SharedJreqRepo } from 'src/shared/repos/shared-join-req.repo';

@Injectable()
export class JoinreqService {
    constructor(
        private readonly joinreqRepo: JoinreqRepo,
        private readonly sharedClassroomRepo: SharedClassroomRepo,
        private readonly sharedClrStdRepo: SharedClrStdRepo,
        private readonly sharedJreqRepo: SharedJreqRepo,
    ) { }

    async createJoinRequest(id: number, body: CreateJoinreqReqDto): Promise<JoinRequest> {
        const existingRequest = await this.joinreqRepo.find({ studentId: id, classroomId: body.classroomId });
        if (existingRequest) {
            if (existingRequest.status !== JoinRequestStatus.rejected) {
                throw new UnprocessableEntityException('Yêu cầu tham gia đã tồn tại');
            } else {
                await this.joinreqRepo.update({
                    id: existingRequest.id,
                    status: JoinRequestStatus.pending,
                    requestedAt: new Date(),
                });
                return existingRequest
            }
        }
        const classroomExists = await this.sharedClassroomRepo.findUnique({ id: body.classroomId });
        if (!classroomExists || classroomExists.deletedAt) {
            throw new UnprocessableEntityException('Lớp học không tồn tại');
        }
        if (classroomExists.isArchived) {
            throw new UnprocessableEntityException('Không thể tham gia lớp học đã lưu trữ');
        }
        return this.joinreqRepo.createJoinRequest(id, body.classroomId);
    }

    async approveJoinRequest(id: number): Promise<JoinRequest> {
        const joinRequest = await this.joinreqRepo.findById(id);
        if (!joinRequest) {
            throw new UnprocessableEntityException('Yêu cầu tham gia không tồn tại');
        }
        const updatedRequest = await this.joinreqRepo.update({
            id: joinRequest.id,
            status: JoinRequestStatus.approved,
            handledAt: new Date(),
        });
        await this.sharedClrStdRepo.create({
            classroomId: joinRequest.classroomId,
            studentId: joinRequest.studentId,
        });
        return updatedRequest;
    }

    async rejectJoinRequest(id: number): Promise<JoinRequest> {
        const joinRequest = await this.joinreqRepo.findById(id);
        if (!joinRequest) {
            throw new UnprocessableEntityException('Yêu cầu tham gia không tồn tại');
        } else if (joinRequest.status === JoinRequestStatus.rejected) {
            throw new UnprocessableEntityException('Yêu cầu tham gia đã bị từ chối trước đó');
        } else if (joinRequest.status === JoinRequestStatus.approved) {
            throw new UnprocessableEntityException('Yêu cầu tham gia đã được chấp thuận từ trước. Không thể từ chối');
        }
        return this.joinreqRepo.update({
            id: joinRequest.id,
            status: JoinRequestStatus.rejected,
            handledAt: new Date(),
        });
    }

    async studentViewClassrooms(studentId: number) {
        const classrooms = await this.joinreqRepo.getStudentClassrooms(studentId);

        return classrooms.map(classroom => {
            // Kiểm tra học sinh đã tham gia (chưa bị xóa)
            const isJoined = classroom.classroomStudents.some(cs => cs.deletedAt === null);
            const joinRequest = classroom.joinRequests.length > 0 ? classroom.joinRequests[0] : null;

            return {
                id: classroom.id,
                name: classroom.name,
                description: classroom.description,
                coverMediaId: classroom.coverMediaId,
                isArchived: classroom.isArchived,
                createdAt: classroom.createdAt,
                updatedAt: classroom.updatedAt,
                isJoined,
                joinRequest: !isJoined && joinRequest ? {
                    id: joinRequest.id,
                    status: joinRequest.status,
                    requestedAt: joinRequest.requestedAt,
                    handledAt: joinRequest.handledAt,
                } : null,
            };
        });
    }

    async studentViewJoinedClassrooms(studentId: number) {
        const classrooms = await this.joinreqRepo.getStudentClassrooms(studentId);
        // Chỉ lấy các lớp học mà học sinh đã tham gia và chưa bị xóa
        return classrooms
            .filter(classroom => classroom.classroomStudents.some(cs => cs.deletedAt === null))
            .map(classroom => ({
                id: classroom.id,
                name: classroom.name,
                description: classroom.description,
                coverMediaId: classroom.coverMediaId,
                isArchived: classroom.isArchived,
                createdAt: classroom.createdAt,
                updatedAt: classroom.updatedAt,
            }));
    }

    async leaveClassroom(studentId: number, classroomId: number) {
        await this.sharedClrStdRepo.update({ studentId, classroomId, deletedAt: new Date() });
        await this.sharedJreqRepo.deleteJreq(classroomId, studentId);
        return { message: 'Rời lớp học thành công' };

    }
}