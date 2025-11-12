import { createZodDto } from "nestjs-zod";
import { LessonQuizResSchema } from "../responses/lesson-quiz-res.dto";
import z from "zod";

export const AssignQuizReqSchema = LessonQuizResSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

export class AssignQuizReqDto extends createZodDto(AssignQuizReqSchema) {}

export type AssignQuizReqType = z.infer<typeof AssignQuizReqSchema>;
