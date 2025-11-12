import { Inject, Injectable, UnprocessableEntityException } from "@nestjs/common";
import type { IQuestionRepo } from "../repos/question.interface.repo";
import { IQuestionService } from "./question.interface.service";
import { QuestionType, QuizQuestion } from "@prisma/client";
import { CreateQuestionReqType } from "../dtos/requests/create-question-req.dto";
import { UpdateQuestionReqType } from "../dtos/requests/update-question-req.dto";
import { ResponseMessage } from "src/shared/types/response-message.type";

@Injectable()
export class QuestionService implements IQuestionService {
    constructor(
        @Inject('IQuestionRepo')
        private readonly questionRepo: IQuestionRepo
    ) { }

    async create(quizId: number, data: CreateQuestionReqType): Promise<QuizQuestion> {
        return await this.questionRepo.create({
            quizId,
            content: data.content,
            questionType: data.questionType ?? QuestionType.single_choice,
            points: data.points ?? 1.0,
            orderIndex: data.orderIndex ?? 0,
            sectionId: data.sectionId ?? undefined,
            groupId: data.groupId ?? undefined,
            explanation: data.explanation ?? undefined,
        });
    }

    async update(data: UpdateQuestionReqType): Promise<QuizQuestion> {
        const existing = await this.questionRepo.findById(data.id);
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy câu hỏi.');
        }

        return await this.questionRepo.update({
            id: data.id,
            sectionId: data.sectionId ?? (existing.sectionId ?? undefined),
            groupId: data.groupId ?? (existing.groupId ?? undefined),
            content: data.content ?? existing.content,
            explanation: data.explanation ?? (existing.explanation ?? undefined),
            questionType: data.questionType ?? existing.questionType,
            points: data.points ?? existing.points,
            orderIndex: data.orderIndex ?? existing.orderIndex,
        });
    }

    async delete(id: number): Promise<ResponseMessage> {
        const existing = await this.questionRepo.findById(id);
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy câu hỏi.');
        }

        await this.questionRepo.delete(id);
        return { message: 'Xóa câu hỏi thành công' };
    }

    async attachMedias(questionId: number, mediaIds: number[]): Promise<ResponseMessage> {
        const existing = await this.questionRepo.findById(questionId);
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy câu hỏi.');
        }

        return await this.questionRepo.attachMedias(questionId, mediaIds);
    }

    async detachMedias(questionId: number, mediaIds: number[]): Promise<ResponseMessage> {
        const existing = await this.questionRepo.findById(questionId);
        if (!existing) {
            throw new UnprocessableEntityException('Không tìm thấy câu hỏi.');
        }

        return await this.questionRepo.detachMedias(questionId, mediaIds);
    }
}