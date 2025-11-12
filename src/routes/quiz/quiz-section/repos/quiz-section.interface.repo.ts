import { QuizSection } from '@prisma/client'

export interface IQuizSectionRepo {
    create(quizId: number, data: {
        title: string
        description?: string | null
        orderIndex?: number
    }): Promise<QuizSection>

    findById(id: number): Promise<QuizSection | null>

    update(data: Partial<QuizSection>): Promise<QuizSection>

    delete(id: number): Promise<void>
}
