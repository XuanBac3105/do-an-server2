import z from "zod";
import { QuizSectionSchema } from "../responses/quiz-section-res.dto";
import { createZodDto } from "nestjs-zod";

export const DeleteQuizSectionReqSchema = QuizSectionSchema.pick({
    id: true,
});

export class DeleteQuizSectionReqDto extends createZodDto(DeleteQuizSectionReqSchema) {}

export type DeleteQuizSectionReqType = z.infer<typeof DeleteQuizSectionReqSchema>;