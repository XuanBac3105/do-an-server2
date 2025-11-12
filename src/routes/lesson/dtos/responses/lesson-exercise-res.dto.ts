import { LessonType } from "@prisma/client";
import { BaseLessonSchema } from "./base-lesson.model";
import z from "zod";
import { createZodDto } from "nestjs-zod";

export const LessonExerciseResSchema = BaseLessonSchema.extend({
    lessonType: z.literal(LessonType.exercise),
    exerciseId: z
        .number({ message: "Exercise ID phải là một số" })
        .int({ message: "Exercise ID phải là một số nguyên" })
        .positive({ message: "Exercise ID phải là một số dương" }),
    exerciseDueAt: z
        .date({ message: "Ngày nộp bài tập phải là một ngày hợp lệ" })
});

export class LessonExerciseResDto extends createZodDto(LessonExerciseResSchema) {}

export type LessonExerciseResType = z.infer<typeof LessonExerciseResSchema>;
