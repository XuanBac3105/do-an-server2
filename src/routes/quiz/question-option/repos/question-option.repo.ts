import { QuizOption } from "@prisma/client";
import { IQuestionOptionRepo } from "./question-option.interface.repo";
import { PrismaService } from "src/shared/services/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class QuestionOptionRepo implements IQuestionOptionRepo {
    constructor(
        private readonly prismaService: PrismaService
    ) {}
    
    create(data: {
        questionId: number,
        content: string,
        isCorrect?: boolean,
        orderIndex?: number,
    }): Promise<QuizOption> {
        return this.prismaService.quizOption.create({
            data: {
                questionId: data.questionId,
                content: data.content,
                isCorrect: data.isCorrect ?? false,
                orderIndex: data.orderIndex ?? 0,
            }
        });
    }

    findById(id: number): Promise<QuizOption | null> {
        return this.prismaService.quizOption.findUnique({
            where: { id }
        });
    }

    update(data: {
        id: number,
        content?: string,
        isCorrect?: boolean,
        orderIndex?: number,
    }): Promise<QuizOption> {
        return this.prismaService.quizOption.update({
            where: { id: data.id },
            data: {
                content: data.content,
                isCorrect: data.isCorrect,
                orderIndex: data.orderIndex,
            }
        });
    }

    async delete(id: number): Promise<void> {
        await this.prismaService.quizOption.delete({
            where: { id }
        });
    }
}