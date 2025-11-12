import { Injectable } from '@nestjs/common'
import { QuizSection } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import type { IQuizSectionRepo } from './quiz-section.interface.repo'

@Injectable()
export class QuizSectionRepo implements IQuizSectionRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async create(quizId: number, data: {
        title: string
        description?: string | null
        orderIndex?: number
    }): Promise<QuizSection> {
        return this.prismaService.quizSection.create({
            data: {
                quizId,
                title: data.title,
                description: data.description ?? null,
                orderIndex: data.orderIndex ?? 0,
            },
        })
    }

    async findById(id: number): Promise<QuizSection | null> {
        return this.prismaService.quizSection.findUnique({
            where: { id },
        })
    }

    async update(data: Partial<QuizSection>): Promise<QuizSection> {
        return this.prismaService.quizSection.update({
            where: { id: data.id },
            data,
        })
    }

    async delete(id: number): Promise<void> {
        await this.prismaService.quizSection.delete({
            where: { id },
        })
    }
}
