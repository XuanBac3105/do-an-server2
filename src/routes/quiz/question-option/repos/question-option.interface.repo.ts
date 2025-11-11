import { QuizOption } from "@prisma/client";

export interface IQuestionOptionRepo {
    create(data: {
        questionId: number,
        content: string,
        isCorrect?: boolean,
        orderIndex?: number,
    }): Promise<QuizOption>
    
    findById(id: number): Promise<QuizOption | null>
    
    update(data: {
        id: number,
        content?: string,
        isCorrect?: boolean,
        orderIndex?: number,
    }): Promise<QuizOption>
    
    delete(id: number): Promise<void>
}