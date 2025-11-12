import z from "zod";
import { BaseLessonSchema } from "./base-lesson.model";
import { LessonType } from "@prisma/client";
import { createZodDto } from "nestjs-zod";
import { LectureTreeNodeSchema } from "./lecture-tree.model";

// Lecture lesson with tree structure
export const LessonLectureWithDetailsSchema = BaseLessonSchema.extend({
    lessonType: z.literal(LessonType.lecture),
    lectureId: z
        .number({ message: "Lecture ID phải là một số" })
        .int({ message: "Lecture ID phải là một số nguyên" })
        .positive({ message: "Lecture ID phải là một số dương" }),
    lecture: LectureTreeNodeSchema,
});

// Exercise lesson with exercise details
export const LessonExerciseWithDetailsSchema = BaseLessonSchema.extend({
    lessonType: z.literal(LessonType.exercise),
    exerciseId: z
        .number({ message: "Exercise ID phải là một số" })
        .int({ message: "Exercise ID phải là một số nguyên" })
        .positive({ message: "Exercise ID phải là một số dương" }),
    exerciseDueAt: z
        .date({ message: "Ngày nộp bài tập phải là một ngày hợp lệ" })
        .nullable()
        .optional(),
    exercise: z.object({
        id: z.number().int().positive(),
        title: z.string(),
        description: z.string().nullable().optional(),
        attachMediaId: z.number().int().positive().nullable().optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
    }),
});

// Quiz lesson with quiz details
export const LessonQuizWithDetailsSchema = BaseLessonSchema.extend({
    lessonType: z.literal(LessonType.quiz),
    quizId: z
        .number({ message: "Quiz ID phải là một số" })
        .int({ message: "Quiz ID phải là một số nguyên" })
        .positive({ message: "Quiz ID phải là một số dương" }),
    quizStartAt: z
        .date({ message: "Ngày bắt đầu quiz phải là một ngày hợp lệ" })
        .nullable()
        .optional(),
    quizEndAt: z
        .date({ message: "Ngày kết thúc quiz phải là một ngày hợp lệ" })
        .nullable()
        .optional(),
    quiz: z.object({
        id: z.number().int().positive(),
        title: z.string(),
        description: z.string().nullable().optional(),
        timeLimit: z.number().int().nullable().optional(),
        passingScore: z.number().nullable().optional(),
        gradingMethod: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
    }),
});

export const LessonWithDetailsSchema = z.discriminatedUnion("lessonType", [
    LessonLectureWithDetailsSchema,
    LessonExerciseWithDetailsSchema,
    LessonQuizWithDetailsSchema,
]);

export const LessonsListResSchema = z.object({
    lessons: z.array(LessonWithDetailsSchema),
});

export class LessonsListResDto extends createZodDto(LessonsListResSchema) {}

export type LessonWithDetailsType = z.infer<typeof LessonWithDetailsSchema>;
export type LessonsListResType = z.infer<typeof LessonsListResSchema>;
