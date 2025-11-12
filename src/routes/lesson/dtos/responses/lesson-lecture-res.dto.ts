import z from "zod";
import { BaseLessonSchema } from "./base-lesson.model";
import { LessonType } from "@prisma/client";
import { createZodDto } from "nestjs-zod";

export const LessonLectureResSchema = BaseLessonSchema.extend({
    lessonType: z.literal(LessonType.lecture),
    lectureId: z
        .number({ message: "Lecture ID phải là một số" })
        .int({ message: "Lecture ID phải là một số nguyên" })
        .positive({ message: "Lecture ID phải là một số dương" }),
});

export class LessonLectureResDto extends createZodDto(LessonLectureResSchema) {}

export type LessonLectureResType = z.infer<typeof LessonLectureResSchema>;
