import { QuestionType, QuizQuestion } from "@prisma/client";

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
    
    findById(id: number): Promise<QuizQuestion | null>
    
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
}