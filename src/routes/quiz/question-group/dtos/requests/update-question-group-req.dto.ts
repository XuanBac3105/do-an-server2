import { createZodDto } from "nestjs-zod";
import { QuestionGroupSchema } from "../responses/question-group-res.dto";
import z from "zod";

export const UpdateQuestionGroupReqSchema = QuestionGroupSchema.omit({
    quizId: true,
    createdAt: true,
});

export class UpdateQuestionGroupReqDto extends createZodDto(UpdateQuestionGroupReqSchema) {}

export type UpdateQuestionGroupReqType = z.infer<typeof UpdateQuestionGroupReqSchema>;