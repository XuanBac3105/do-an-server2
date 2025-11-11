import { createZodDto } from "nestjs-zod";
import z from "zod";
import { QuizSectionSchema } from "../responses/quiz-section-res.dto";

export const UpdateQuizSectionSchema = QuizSectionSchema.omit({
    quizId: true,
})

export class UpdateQuizSectionReqDto extends createZodDto(UpdateQuizSectionSchema) {}

export type UpdateQuizSectionReqType = z.infer<typeof UpdateQuizSectionSchema>;