import { Quiz } from '@prisma/client'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { GetQuizzesQueryType } from '../dtos/queries/get-quizzes.dto'
import { CreateQuizReqType } from '../dtos/requests/create-quiz-req.dto'
import { UpdateQuizReqType } from '../dtos/requests/update-quiz-req.dto'
import { ListQuizzesResType } from '../dtos/responses/list-quizzes-res.dto'
import { QuizResDto } from '../dtos/responses/quiz-res.dto'
import { QuizDetailResType } from '../dtos/responses/quiz-detail-res.dto'

export interface IQuizService {
    create(data: CreateQuizReqType): Promise<QuizResDto>
    getAll(query: GetQuizzesQueryType): Promise<ListQuizzesResType>
    getById(id: number): Promise<QuizDetailResType>
    update(id: number, data: UpdateQuizReqType): Promise<QuizResDto>
    delete(id: number): Promise<ResponseMessage>
}
