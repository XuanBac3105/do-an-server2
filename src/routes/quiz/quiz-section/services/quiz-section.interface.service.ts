import { QuizSection } from '@prisma/client'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { CreateQuizSectionReqType } from '../dtos/requests/create-quiz-section-req.dto'
import { UpdateQuizSectionReqType } from '../dtos/requests/update-quiz-section-req.dto'

export interface IQuizSectionService {
    create(quizId: number, data: CreateQuizSectionReqType): Promise<QuizSection>
    update(data: UpdateQuizSectionReqType): Promise<QuizSection>
    delete(id: number): Promise<ResponseMessage>
}
