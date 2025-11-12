import { Inject, Injectable, UnprocessableEntityException } from "@nestjs/common";
import type { IQuestionOptionRepo } from "../repos/question-option.interface.repo";
import { IQuestionOptionService } from "./question-option.interface.service";
import { QuizOption } from "@prisma/client";
import { CreateQuestionOptionReqType } from "../dtos/requests/create-question-option-req.dto";
import { UpdateQuestionOptionReqType } from "../dtos/requests/update-question-option-req.dto";
import { ResponseMessage } from "src/shared/types/response-message.type";

@Injectable()
export class QuestionOptionService implements IQuestionOptionService {
    constructor(
        @Inject('IQuestionOptionRepo')
        private readonly questionOptionRepo: IQuestionOptionRepo
    ) { }

    async create(questionId: number, data: CreateQuestionOptionReqType): Promise<QuizOption> {
        return await this.questionOptionRepo.create({
            questionId,
            content: data.content,
            isCorrect: data.isCorrect ?? false,
            orderIndex: data.orderIndex ?? 0,
        });
    }

    async update(data: UpdateQuestionOptionReqType): Promise<QuizOption> {
        const existing = await this.questionOptionRepo.findById(data.id);
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy lựa chọn.');
        }

        return await this.questionOptionRepo.update({
            id: data.id,
            content: data.content ?? existing.content,
            isCorrect: data.isCorrect ?? existing.isCorrect,
            orderIndex: data.orderIndex ?? existing.orderIndex,
        });
    }

    async delete(id: number): Promise<ResponseMessage> {
        const existing = await this.questionOptionRepo.findById(id);
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy lựa chọn.');
        }

        await this.questionOptionRepo.delete(id);
        return { message: 'Xóa lựa chọn thành công' };
    }

    async attachMedias(optionId: number, mediaIds: number[]): Promise<ResponseMessage> {
        const existing = await this.questionOptionRepo.findById(optionId);
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy lựa chọn.');
        }

        return await this.questionOptionRepo.attachMedias(optionId, mediaIds);
    }

    async detachMedias(optionId: number, mediaIds: number[]): Promise<ResponseMessage> {
        const existing = await this.questionOptionRepo.findById(optionId);
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy lựa chọn.');
        }

        return await this.questionOptionRepo.detachMedias(optionId, mediaIds);
    }
}
