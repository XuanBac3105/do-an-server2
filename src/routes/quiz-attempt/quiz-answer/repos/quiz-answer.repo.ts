import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { QuizAnswer } from '@prisma/client';
import { IQuizAnswerRepo } from './quiz-answer.interface.repo';

@Injectable()
export class QuizAnswerRepo implements IQuizAnswerRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async create(data: {
        attemptId: number,
        questionId: number,
        optionId: number,
    }): Promise<QuizAnswer> {
        return this.prismaService.quizAnswer.create({
            data: {
                attempt: { connect: { id: data.attemptId } },
                question: { connect: { id: data.questionId } },
                option: { connect: { id: data.optionId } },
            }
        });
    }

    async findMany(
        where: {
            attemptId?: number,
            questionId?: number,
            optionId?: number,
        },
        skip?: number,
        take?: number
    ) {
        return this.prismaService.quizAnswer.findMany({
            where,
            skip,
            take,
            orderBy: { questionId: 'asc' },
            include: {
                question: {
                    select: {
                        id: true,
                        quizId: true,
                        content: true,
                        explanation: true,
                        questionType: true,
                        points: true,
                        orderIndex: true,
                    },
                },
                option: {
                    select: {
                        id: true,
                        questionId: true,
                        content: true,
                        isCorrect: true,
                        orderIndex: true,
                    },
                },
            },
        });
    }

    async count(where: {
        attemptId?: number,
        questionId?: number,
        optionId?: number,
    }): Promise<number> {
        return this.prismaService.quizAnswer.count({ where });
    }

    async findUnique(where: {
        attemptId: number,
        questionId: number,
        optionId: number,
    }): Promise<QuizAnswer | null> {
        return this.prismaService.quizAnswer.findUnique({
            where: {
                attemptId_questionId_optionId: where
            }
        });
    }

    async update(
        where: {
            attemptId: number,
            questionId: number,
            optionId: number,
        },
        data: {
            optionId?: number,
        }
    ): Promise<QuizAnswer> {
        return this.prismaService.quizAnswer.update({
            where: {
                attemptId_questionId_optionId: where
            },
            data
        });
    }

    async delete(where: {
        attemptId: number,
        questionId: number,
        optionId: number,
    }): Promise<QuizAnswer> {
        return this.prismaService.quizAnswer.delete({
            where: {
                attemptId_questionId_optionId: where
            }
        });
    }

    async findAttemptWithAnswers(attemptId: number) {
        return this.prismaService.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                answers: {
                    include: {
                        question: true,
                        option: true,
                    },
                },
            },
        });
    }

    async updateAttemptScore(attemptId: number, scoreRaw: number, scoreScaled10: number) {
        return this.prismaService.quizAttempt.update({
            where: { id: attemptId },
            data: {
                scoreRaw,
                scoreScaled10,
            },
        });
    }
}