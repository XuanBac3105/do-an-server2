import { QuestionType, QuizQuestion } from "@prisma/client";
import { ResponseMessage } from "src/shared/types/response-message.type";

export interface IQuestionRepo {
    create(data: {
        quizId: number,
        sectionId?: number,
        groupId?: number,
        content: string,
        explanation?: string,
        questionType?: QuestionType,
        points?: number,
        orderIndex?: number,
    }): Promise<QuizQuestion>
    
    findById(id: number, includeMedias?: boolean): Promise<QuizQuestion | null>
    
    update(data: {
        id: number,
        sectionId?: number,
        groupId?: number,
        content?: string,
        explanation?: string,
        questionType?: QuestionType,
        points?: number,
        orderIndex?: number,
    }): Promise<QuizQuestion>
    
    delete(id: number): Promise<void>

    attachMedias(questionId: number, mediaIds: number[]): Promise<ResponseMessage>

    detachMedias(questionId: number, mediaIds: number[]): Promise<ResponseMessage>

    getMedias(questionId: number): Promise<any[]>
}