import { GradingMethod, Prisma, Quiz } from '@prisma/client'
import { QuizDetailResType } from '../dtos/responses/quiz-detail-res.dto'

export interface IQuizRepo {
    create(data: {
        title: string
        description?: string | null
        timeLimitSec: number
        maxAttempts?: number
        shuffleQuestions?: boolean
        shuffleOptions?: boolean
        gradingMethod?: GradingMethod
        showAnswers?: boolean
    }): Promise<Quiz>

    count(where: Prisma.QuizWhereInput): Promise<number>

    findMany(where: Prisma.QuizWhereInput, orderBy: object, skip: number, take: number): Promise<Quiz[]>

    findById(id: number): Promise<Quiz | null>
    
    findByIdWithDetails(id: number): Promise<QuizDetailResType | null>

    update(id: number, data: Partial<Quiz>): Promise<Quiz>
}
