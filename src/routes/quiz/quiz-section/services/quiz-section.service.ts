import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { QuizSection } from '@prisma/client'
import type { IQuizSectionRepo } from '../repos/quiz-section.interface.repo'
import type { IQuizSectionService } from './quiz-section.interface.service'
import { CreateQuizSectionReqType } from '../dtos/requests/create-quiz-section-req.dto'
import { UpdateQuizSectionReqType } from '../dtos/requests/update-quiz-section-req.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type'

@Injectable()
export class QuizSectionService implements IQuizSectionService {
    constructor(
        @Inject('IQuizSectionRepo')
        private readonly quizSectionRepo: IQuizSectionRepo,
    ) {}

    async create(quizId: number, data: CreateQuizSectionReqType): Promise<QuizSection> {
        return await this.quizSectionRepo.create(quizId, {
            title: data.title,
            description: data.description ?? null,
            orderIndex: data.orderIndex ?? 0,
        })
    }

    async update(data: UpdateQuizSectionReqType): Promise<QuizSection> {
        const existing = await this.quizSectionRepo.findById(data.id)
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy phần bài kiểm tra.')
        }

        return await this.quizSectionRepo.update({
            id: data.id,
            title: data.title ?? existing.title,
            description: data.description ?? existing.description,
            orderIndex: data.orderIndex ?? existing.orderIndex,
        })
    }

    async delete(id: number): Promise<ResponseMessage> {
        const existing = await this.quizSectionRepo.findById(id)
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy phần bài kiểm tra.')
        }

        await this.quizSectionRepo.delete(id)
        return { message: 'Xóa phần bài kiểm tra thành công' }
    }
}
