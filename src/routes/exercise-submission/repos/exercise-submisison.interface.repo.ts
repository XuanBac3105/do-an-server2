import { ExerciseSubmission, Lesson, Media, User } from "@prisma/client";

export interface IExerciseSubmissionRepo {
    create(data: {
        lessonId: number;
        exerciseId: number;
        studentId: number;
        mediaId: number;
    }): Promise<ExerciseSubmission & { media: Media }>;

    findLessonExerciseById(lessonId: number, exerciseId: number): Promise<Lesson | null>;

    findUnique(data: { lessonId: number, studentId: number }): Promise<ExerciseSubmission | null>;

    findById(id: number): Promise<ExerciseSubmission | null>;

    delete(id: number): Promise<ExerciseSubmission>;

    findByLessonId(lessonId: number): Promise<(ExerciseSubmission & { media: Media, student: User })[]>;

    update(id: number, data: {
        score: number;
        comment?: string | null;
        gradedAt: Date;
    }): Promise<ExerciseSubmission & { media: Media, student: User }>;
}