import { QuizOption } from "@prisma/client";
import { CreateQuestionOptionReqType } from "../dtos/requests/create-question-option-req.dto";
import { UpdateQuestionOptionReqType } from "../dtos/requests/update-question-option-req.dto";
import { ResponseMessage } from "src/shared/types/response-message.type";

export interface IQuestionOptionService {
    create(
        questionId: number,
        data: CreateQuestionOptionReqType
    ): Promise<QuizOption>;
    update(data: UpdateQuestionOptionReqType): Promise<QuizOption>;
    delete(id: number): Promise<ResponseMessage>;
    attachMedias(optionId: number, mediaIds: number[]): Promise<ResponseMessage>;
    detachMedias(optionId: number, mediaIds: number[]): Promise<ResponseMessage>;
}
