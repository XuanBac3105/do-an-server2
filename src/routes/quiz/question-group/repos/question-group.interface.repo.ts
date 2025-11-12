import { QuizQuestionGroup } from '@prisma/client'
import { ResponseMessage } from 'src/shared/types/response-message.type'

export interface IQuestionGroupRepo {
    create(data: {
        sectionId?: number
        quizId: number
        title?: string
        introText?: string
        orderIndex?: number
        shuffleInside?: boolean
    }): Promise<QuizQuestionGroup>

    findById(id: number, includeMedias?: boolean): Promise<QuizQuestionGroup | null>

    update(data: Partial<QuizQuestionGroup>): Promise<QuizQuestionGroup>

    delete(id: number): Promise<void>

    attachMedias(groupId: number, mediaIds: number[]): Promise<ResponseMessage>

    detachMedias(groupId: number, mediaIds: number[]): Promise<ResponseMessage>

    getMedias(groupId: number): Promise<any[]>
}
