import { QuizQuestionGroup } from '@prisma/client'

export interface IQuestionGroupRepo {
    create(data: {
        sectionId?: number
        quizId: number
        title?: string
        introText?: string
        orderIndex?: number
        shuffleInside?: boolean
    }): Promise<QuizQuestionGroup>

    findById(id: number): Promise<QuizQuestionGroup | null>

    update(data: Partial<QuizQuestionGroup>): Promise<QuizQuestionGroup>

    delete(id: number): Promise<void>
}