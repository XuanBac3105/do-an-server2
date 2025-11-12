import { QuizOption } from "@prisma/client";
import { ResponseMessage } from "src/shared/types/response-message.type";

export interface IQuestionOptionRepo {
    create(data: {
        questionId: number,
        content: string,
        isCorrect?: boolean,
        orderIndex?: number,
    }): Promise<QuizOption>

    findById(id: number, includeMedias?: boolean): Promise<QuizOption | null>

    update(data: {
        id: number,
        content?: string,
        isCorrect?: boolean,
        orderIndex?: number,
    }): Promise<QuizOption>

    delete(id: number): Promise<void>

    attachMedias(optionId: number, mediaIds: number[]): Promise<ResponseMessage>

    detachMedias(optionId: number, mediaIds: number[]): Promise<ResponseMessage>

    getMedias(optionId: number): Promise<any[]>
}
