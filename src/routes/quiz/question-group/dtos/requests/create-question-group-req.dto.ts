import z from "zod";
import { QuestionGroupSchema } from "../responses/question-group-res.dto";
import { createZodDto } from "nestjs-zod";

export const CreateQuestionGroupReqSchema = QuestionGroupSchema.omit({
    id: true,
    quizId: true,
    createdAt: true,
});

export class CreateQuestionGroupReqDto extends createZodDto(CreateQuestionGroupReqSchema) {}

export type CreateQuestionGroupReqType = z.infer<typeof CreateQuestionGroupReqSchema>;