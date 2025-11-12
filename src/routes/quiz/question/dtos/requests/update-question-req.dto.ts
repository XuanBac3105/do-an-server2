import { createZodDto } from "nestjs-zod";
import { QuestionSchema } from "../responses/question-res.dto";
import z from "zod";

export const UpdateQuestionReqSchema = QuestionSchema.omit({
    quizId: true,
});

export class UpdateQuestionReqDto extends createZodDto(UpdateQuestionReqSchema) {}

export type UpdateQuestionReqType = z.infer<typeof UpdateQuestionReqSchema>;
