import z from "zod";
import { QuestionGroupSchema } from "../responses/question-group-res.dto";
import { createZodDto } from "nestjs-zod";

export const DeleteQuestionGroupReqSchema = QuestionGroupSchema.pick({
    id: true,
})

export class DeleteQuestionGroupReqDto extends createZodDto(DeleteQuestionGroupReqSchema) {}

export type DeleteQuestionGroupReqType = z.infer<typeof DeleteQuestionGroupReqSchema>;