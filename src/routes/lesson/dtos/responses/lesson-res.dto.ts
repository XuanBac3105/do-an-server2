import z from "zod";
import { LessonLectureResSchema } from "./lesson-lecture-res.dto";
import { LessonExerciseResSchema } from "./lesson-exercise-res.dto";
import { LessonQuizResSchema } from "./lesson-quiz-res.dto";

export const LessonResSchema = z.discriminatedUnion("lessonType", [
    LessonLectureResSchema,
    LessonExerciseResSchema,
    LessonQuizResSchema,
]);

export type LessonResType = z.infer<typeof LessonResSchema>;