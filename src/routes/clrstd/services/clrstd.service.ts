import { SharedClrStdRepo } from 'src/shared/repos/shared-clrstd.repo'
import { Injectable } from '@nestjs/common'
import { SharedJreqRepo } from 'src/shared/repos/shared-join-req.repo'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { UpdateClrStdType } from '../dtos/requests/update-clrstd.dto'
import { IClrstdService } from './clrstd.interface.service'

@Injectable()
export class ClrstdService implements IClrstdService {
    constructor(
        private readonly sharedJreqRepo: SharedJreqRepo,
        private readonly sharedClrStdRepo: SharedClrStdRepo,
    ) {}

    async deactivate(body: UpdateClrStdType): Promise<ResponseMessage> {
        await this.sharedClrStdRepo.update({
            classroomId: body.classroomId,
            studentId: body.studentId,
            isActive: false,
        })
        await this.sharedJreqRepo.deleteJreq(body.classroomId, body.studentId)
        return { message: 'Học sinh đã bị chặn truy cập vào lớp học' }
    }

    async activate(body: UpdateClrStdType): Promise<ResponseMessage> {
        await this.sharedClrStdRepo.update({
            classroomId: body.classroomId,
            studentId: body.studentId,
            isActive: true,
        })
        return { message: 'Đã bỏ chặn học sinh' }
    }

    async deleteStudent(body: UpdateClrStdType): Promise<ResponseMessage> {
        await this.sharedClrStdRepo.update({
            classroomId: body.classroomId,
            studentId: body.studentId,
            deletedAt: new Date(),
        })
        await this.sharedJreqRepo.deleteJreq(body.classroomId, body.studentId)
        return { message: 'Học sinh đã bị xóa khỏi lớp học' }
    }
}
