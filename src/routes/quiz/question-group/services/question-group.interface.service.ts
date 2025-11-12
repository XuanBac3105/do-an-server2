import { ResponseMessage } from 'src/shared/types/response-message.type'
import { CreateQuestionGroupReqType } from '../dtos/requests/create-question-group-req.dto'
import { UpdateQuestionGroupReqType } from '../dtos/requests/update-question-group-req.dto'
import { QuestionGroupResDto } from '../dtos/responses/question-group-res.dto'

export interface IQuestionGroupService {
    create(quizId: number, data: CreateQuestionGroupReqType): Promise<QuestionGroupResDto>
    update(data: UpdateQuestionGroupReqType): Promise<QuestionGroupResDto>
    delete(id: number): Promise<ResponseMessage>
    attachMedias(groupId: number, mediaIds: number[]): Promise<ResponseMessage>
    detachMedias(groupId: number, mediaIds: number[]): Promise<ResponseMessage>
}
