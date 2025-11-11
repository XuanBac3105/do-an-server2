import { Injectable } from '@nestjs/common'
import { QuizQuestionGroup } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import type { IQuestionGroupRepo } from './question-group.interface.repo'

@Injectable()
export class QuestionGroupRepo implements IQuestionGroupRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async create(data: {
        sectionId?: number
        quizId: number
        title?: string
        introText?: string
        orderIndex?: number
        shuffleInside?: boolean
    }): Promise<QuizQuestionGroup> {
        return this.prismaService.quizQuestionGroup.create({
            data: {
                sectionId: data.sectionId ?? null,
                quizId: data.quizId,
                title: data.title ?? null,
                introText: data.introText ?? null,
                orderIndex: data.orderIndex ?? 0,
                shuffleInside: data.shuffleInside ?? false,
            },
        })
    }

    async findById(id: number): Promise<QuizQuestionGroup | null> {
        return this.prismaService.quizQuestionGroup.findUnique({
            where: { id },
        })
    }

    async update(data: Partial<QuizQuestionGroup>): Promise<QuizQuestionGroup> {
        return this.prismaService.quizQuestionGroup.update({
            where: { id: data.id },
            data,
        })
    }

    async delete(id: number): Promise<void> {
        await this.prismaService.quizQuestionGroup.delete({
            where: { id },
        })
    }
}