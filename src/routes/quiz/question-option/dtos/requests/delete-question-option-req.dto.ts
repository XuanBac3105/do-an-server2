import z from "zod";
import { QuestionOptionSchema } from "../responses/question-option-res.dto";
import { createZodDto } from "nestjs-zod";

export const DeleteQuestionOptionReqSchema = QuestionOptionSchema.pick({
    id: true,
})

export class DeleteQuestionOptionReqDto extends createZodDto(DeleteQuestionOptionReqSchema) {}

export type DeleteQuestionOptionReqType = z.infer<typeof DeleteQuestionOptionReqSchema>;
