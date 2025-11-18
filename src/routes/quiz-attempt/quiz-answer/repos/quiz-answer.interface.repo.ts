import { Prisma, QuizAnswer, QuizAttempt } from "@prisma/client"

type QuizAnswerWithDetails = Prisma.QuizAnswerGetPayload<{
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
            }
        },
        option: {
            select: {
                id: true,
                questionId: true,
                content: true,
                isCorrect: true,
                orderIndex: true,
            }
        }
    }
}>

type QuizAttemptWithAnswers = Prisma.QuizAttemptGetPayload<{
    include: {
        answers: {
            include: {
                question: true,
                option: true,
            }
        }
    }
}>

export interface IQuizAnswerRepo {
    create(data: {
        attemptId: number,
        questionId: number,
        optionId: number,
    }): Promise<QuizAnswer>

    findMany(
        where: {
            attemptId?: number,
            questionId?: number,
            optionId?: number,
        },
        skip?: number,
        take?: number
    ): Promise<QuizAnswerWithDetails[]>

    count(where: {
        attemptId?: number,
        questionId?: number,
        optionId?: number,
    }): Promise<number> 

    findUnique(where: {
        attemptId: number,
        questionId: number,
        optionId: number,
    }): Promise<QuizAnswer | null>

    update(
        where: {
            attemptId: number,
            questionId: number,
            optionId: number,
        },
        data: {
            optionId?: number,
        }
    ): Promise<QuizAnswer>

    delete(where: {
        attemptId: number,
        questionId: number,
        optionId: number,
    }): Promise<QuizAnswer>

    findAttemptWithAnswers(attemptId: number): Promise<QuizAttemptWithAnswers | null>

    updateAttemptScore(attemptId: number, scoreRaw: number, scoreScaled10: number): Promise<QuizAttempt>
}

