import { createZodDto } from "nestjs-zod";
import { QuizSectionSchema } from "../responses/quiz-section-res.dto";
import z from "zod";

export const CreateQuizSectionSchema = QuizSectionSchema.omit({
    id: true,
    quizId: true,
})

export class CreateQuizSectionReqDto extends createZodDto(CreateQuizSectionSchema) {}

export type CreateQuizSectionReqType = z.infer<typeof CreateQuizSectionSchema>;