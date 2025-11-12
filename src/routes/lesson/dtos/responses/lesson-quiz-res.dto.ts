import { LessonType } from "@prisma/client";
import { BaseLessonSchema } from "./base-lesson.model";
import z from "zod";
import { createZodDto } from "nestjs-zod";

export const LessonQuizResSchema = BaseLessonSchema.extend({
    lessonType: z.literal(LessonType.quiz),
    quizId: z
        .number({ message: "Quiz ID phải là một số" })
        .int({ message: "Quiz ID phải là một số nguyên" })
        .positive({ message: "Quiz ID phải là một số dương" }),
    quizStartAt: z
        .date({ message: "Ngày bắt đầu quiz phải là một ngày hợp lệ" }),
    quizEndAt: z
        .date({ message: "Ngày kết thúc quiz phải là một ngày hợp lệ" })
});

export class LessonQuizResDto extends createZodDto(LessonQuizResSchema) {}

export type LessonQuizResType = z.infer<typeof LessonQuizResSchema>;
