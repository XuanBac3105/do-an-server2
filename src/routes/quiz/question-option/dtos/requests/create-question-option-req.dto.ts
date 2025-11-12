import { createZodDto } from "nestjs-zod";
import { QuestionOptionSchema } from "../responses/question-option-res.dto";
import z from "zod";

export const CreateQuestionOptionReqSchema = QuestionOptionSchema.omit({
    id: true,
    questionId: true,
});

export class CreateQuestionOptionReqDto extends createZodDto(CreateQuestionOptionReqSchema) {}

export type CreateQuestionOptionReqType = z.infer<typeof CreateQuestionOptionReqSchema>;
