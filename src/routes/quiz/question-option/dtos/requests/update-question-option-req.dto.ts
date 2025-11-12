import { createZodDto } from "nestjs-zod";
import { QuestionOptionSchema } from "../responses/question-option-res.dto";
import z from "zod";

export const UpdateQuestionOptionReqSchema = QuestionOptionSchema.omit({
    questionId: true,
});

export class UpdateQuestionOptionReqDto extends createZodDto(UpdateQuestionOptionReqSchema) {}

export type UpdateQuestionOptionReqType = z.infer<typeof UpdateQuestionOptionReqSchema>;
