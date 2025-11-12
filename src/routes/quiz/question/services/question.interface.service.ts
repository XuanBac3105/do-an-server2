import { QuizQuestion } from "@prisma/client";
import { CreateQuestionReqType } from "../dtos/requests/create-question-req.dto";
import { UpdateQuestionReqType } from "../dtos/requests/update-question-req.dto";
import { ResponseMessage } from "src/shared/types/response-message.type";

export interface IQuestionService {
    create(
        quizId: number,
        data: CreateQuestionReqType
    ): Promise<QuizQuestion>;
    update(data: UpdateQuestionReqType): Promise<QuizQuestion>;
    delete(id: number): Promise<ResponseMessage>;
    attachMedias(questionId: number, mediaIds: number[]): Promise<ResponseMessage>;
    detachMedias(questionId: number, mediaIds: number[]): Promise<ResponseMessage>;
}