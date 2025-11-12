import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import type { IQuestionGroupRepo } from '../repos/question-group.interface.repo'
import type { IQuestionGroupService } from './question-group.interface.service'
import { QuestionGroupResDto } from '../dtos/responses/question-group-res.dto'
import { CreateQuestionGroupReqType } from '../dtos/requests/create-question-group-req.dto'
import { UpdateQuestionGroupReqType } from '../dtos/requests/update-question-group-req.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type'

@Injectable()
export class QuestionGroupService implements IQuestionGroupService {
    constructor(
        @Inject('IQuestionGroupRepo')
        private readonly questionGroupRepo: IQuestionGroupRepo,
    ) {}

    async create(quizId: number, data: CreateQuestionGroupReqType): Promise<QuestionGroupResDto> {
        return await this.questionGroupRepo.create({
            quizId: quizId,
            sectionId: data.sectionId ?? undefined,
            title: data.title ?? undefined,
            introText: data.introText ?? undefined,
            orderIndex: data.orderIndex ?? 0,
            shuffleInside: data.shuffleInside ?? false,
        })
    }

    async update(data: UpdateQuestionGroupReqType): Promise<QuestionGroupResDto> {
        const existing = await this.questionGroupRepo.findById(data.id)
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy nhóm câu hỏi.')
        }

        return await this.questionGroupRepo.update({
            id: data.id,
            sectionId: data.sectionId ?? existing.sectionId,
            title: data.title ?? existing.title,
            introText: data.introText ?? existing.introText,
            orderIndex: data.orderIndex ?? existing.orderIndex,
            shuffleInside: data.shuffleInside ?? existing.shuffleInside,
        })
    }

    async delete(id: number): Promise<ResponseMessage> {
        const existing = await this.questionGroupRepo.findById(id)
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy nhóm câu hỏi.')
        }

        await this.questionGroupRepo.delete(id)
        return { message: 'Xóa nhóm câu hỏi thành công' }
    }

    async attachMedias(groupId: number, mediaIds: number[]): Promise<ResponseMessage> {
        const existing = await this.questionGroupRepo.findById(groupId)
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy nhóm câu hỏi.')
        }

        return await this.questionGroupRepo.attachMedias(groupId, mediaIds)
    }

    async detachMedias(groupId: number, mediaIds: number[]): Promise<ResponseMessage> {
        const existing = await this.questionGroupRepo.findById(groupId)
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy nhóm câu hỏi.')
        }

        return await this.questionGroupRepo.detachMedias(groupId, mediaIds)
    }
}
