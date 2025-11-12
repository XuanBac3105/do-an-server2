import { createZodDto } from "nestjs-zod";
import { LessonExerciseResSchema } from "../responses/lesson-exercise-res.dto";
import z from "zod";

export const AssignExerciseReqSchema = LessonExerciseResSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

export class AssignExerciseReqDto extends createZodDto(AssignExerciseReqSchema) {}

export type AssignExerciseReqType = z.infer<typeof AssignExerciseReqSchema>;
