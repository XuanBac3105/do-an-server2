import { createZodDto } from "nestjs-zod";
import { QuestionSchema } from "../responses/question-res.dto";
import z from "zod";

export const CreateQuestionReqSchema = QuestionSchema.omit({
    id: true,
    quizId: true,
});

export class CreateQuestionReqDto extends createZodDto(CreateQuestionReqSchema) {}

export type CreateQuestionReqType = z.infer<typeof CreateQuestionReqSchema>;