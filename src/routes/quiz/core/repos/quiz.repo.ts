import { Injectable } from '@nestjs/common'
import { GradingMethod, Prisma, Quiz } from '@prisma/client'
import type { IQuizRepo } from './quiz.interface.repo'
import { PrismaService } from 'src/shared/services/prisma.service'
import { QuizDetailResType } from '../dtos/responses/quiz-detail-res.dto'

@Injectable()
export class QuizRepo implements IQuizRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async create(data: {
        title: string
        description?: string | null
        timeLimitSec: number
        maxAttempts?: number
        shuffleQuestions?: boolean
        shuffleOptions?: boolean
        gradingMethod?: GradingMethod
        showAnswers?: boolean
    }): Promise<Quiz> {
        return this.prismaService.quiz.create({ data })
    }

    async count(where: Prisma.QuizWhereInput): Promise<number> {
        return this.prismaService.quiz.count({ where })
    }

    async findMany(where: Prisma.QuizWhereInput, orderBy: object, skip: number, take: number): Promise<Quiz[]> {
        return this.prismaService.quiz.findMany({
            where,
            orderBy,
            skip,
            take,
        })
    }

    async findById(id: number): Promise<Quiz | null> {
        return this.prismaService.quiz.findUnique({
            where: {
                id,
                deletedAt: null,
            },
        })
    }

    async findByIdWithDetails(id: number): Promise<QuizDetailResType | null> {
        const quiz = await this.prismaService.quiz.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                sections: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        questionGroups: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                questions: {
                                    orderBy: { orderIndex: 'asc' },
                                    include: {
                                        options: {
                                            orderBy: { orderIndex: 'asc' },
                                        },
                                    },
                                },
                            },
                        },
                        questions: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                options: {
                                    orderBy: { orderIndex: 'asc' },
                                },
                            },
                        },
                    },
                },
                questionGroups: {
                    where: { sectionId: null },
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        questions: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                options: {
                                    orderBy: { orderIndex: 'asc' },
                                },
                            },
                        },
                    },
                },
                questions: {
                    where: {
                        sectionId: null,
                        groupId: null,
                    },
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        options: {
                            orderBy: { orderIndex: 'asc' },
                        },
                    },
                },
            },
        })

        return quiz as QuizDetailResType | null
    }

    async update(id: number, data: Partial<Quiz>): Promise<Quiz> {
        return this.prismaService.quiz.update({
            where: { id },
            data,
        })
    }
}
