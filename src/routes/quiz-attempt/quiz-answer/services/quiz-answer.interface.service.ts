import { CreateQuizAnswerReqType } from '../dtos/requests/create-quiz-answer-req.dto';
import { QuizAnswerResType } from '../dtos/responses/quiz-answer-res.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type';

export interface IQuizAnswerService {
    upsertAnswer(userId: number, attemptId: number, data: CreateQuizAnswerReqType): Promise<QuizAnswerResType>;
    deleteAnswer(userId: number, attemptId: number, questionId: number): Promise<ResponseMessage>;
}