import { createZodDto } from "nestjs-zod";
import z from "zod";
import { QuizSchema } from "./quiz-res.dto";
import { QuestionType } from "@prisma/client";

const QuestionOptionSchema = z.object({
    id: z.number(),
    questionId: z.number(),
    content: z.string(),
    isCorrect: z.boolean(),
    orderIndex: z.number(),
});

const QuestionDetailSchema = z.object({
    id: z.number(),
    quizId: z.number(),
    sectionId: z.number().nullable(),
    groupId: z.number().nullable(),
    content: z.string(),
    explanation: z.string().nullable(),
    questionType: z.nativeEnum(QuestionType),
    points: z.number(),
    orderIndex: z.number(),
    options: z.array(QuestionOptionSchema),
});

const QuestionGroupDetailSchema = z.object({
    id: z.number(),
    quizId: z.number(),
    sectionId: z.number().nullable(),
    title: z.string().nullable(),
    introText: z.string().nullable(),
    orderIndex: z.number(),
    shuffleInside: z.boolean(),
    createdAt: z.date(),
    questions: z.array(QuestionDetailSchema),
});

const SectionDetailSchema = z.object({
    id: z.number(),
    quizId: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    orderIndex: z.number(),
    questionGroups: z.array(QuestionGroupDetailSchema),
    questions: z.array(QuestionDetailSchema),
});

export const QuizDetailResSchema = QuizSchema.extend({
    sections: z.array(SectionDetailSchema),
    questionGroups: z.array(QuestionGroupDetailSchema),
    questions: z.array(QuestionDetailSchema),
});

export class QuizDetailResDto extends createZodDto(QuizDetailResSchema) {}

export type QuizDetailResType = z.infer<typeof QuizDetailResSchema>;
