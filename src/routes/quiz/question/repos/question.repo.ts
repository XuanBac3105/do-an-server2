import { QuestionType, QuizQuestion } from "@prisma/client";
import { IQuestionRepo } from "./question.interface.repo";
import { PrismaService } from "src/shared/services/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class QuestionRepo implements IQuestionRepo {
    constructor(
        private readonly prismaService: PrismaService
    ) {}
    
    create(data: {
        quizId: number,
        sectionId?: number,
        groupId?: number,
        content: string,
        explanation?: string,
        questionType?: QuestionType,
        points?: number,
        orderIndex?: number,
    }): Promise<QuizQuestion> {
        return this.prismaService.quizQuestion.create({
            data: {
                quizId: data.quizId,
                sectionId: data.sectionId,
                groupId: data.groupId,
                content: data.content,
                explanation: data.explanation ?? null,
                questionType: data.questionType ?? QuestionType.single_choice,
                points: data.points ?? 1.0,
                orderIndex: data.orderIndex ?? 0,
            }
        });
    }

    findById(id: number): Promise<QuizQuestion | null> {
        return this.prismaService.quizQuestion.findUnique({
            where: { id }
        });
    }

    update(data: {
        id: number,
        sectionId?: number,
        groupId?: number,
        content?: string,
        explanation?: string,
        questionType?: QuestionType,
        points?: number,
        orderIndex?: number,
    }): Promise<QuizQuestion> {
        return this.prismaService.quizQuestion.update({
            where: { id: data.id },
            data: {
                sectionId: data.sectionId,
                groupId: data.groupId,
                content: data.content,
                explanation: data.explanation,
                questionType: data.questionType,
                points: data.points,
                orderIndex: data.orderIndex,
            }
        });
    }

    async delete(id: number): Promise<void> {
        await this.prismaService.quizQuestion.delete({
            where: { id }
        });
    }
}