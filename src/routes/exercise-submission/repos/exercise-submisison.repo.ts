import { Injectable } from "@nestjs/common";
import { IExerciseSubmissionRepo } from "./exercise-submisison.interface.repo";
import { PrismaService } from "src/shared/services/prisma.service";
import { ExerciseSubmission, Lesson, Media, User } from "@prisma/client";

@Injectable()
export class ExerciseSubmissionRepo implements IExerciseSubmissionRepo {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    async create(data: {
        lessonId: number;
        exerciseId: number;
        studentId: number;
        mediaId: number;
    }): Promise<ExerciseSubmission & { media: Media }> {
        return this.prismaService.exerciseSubmission.create({
            data: {
                lessonId: data.lessonId,
                exerciseId: data.exerciseId,
                studentId: data.studentId,
                mediaId: data.mediaId,
            },
            include: {
                media: true,
            },
        });
    }

    async findLessonExerciseById(lessonId: number, exerciseId: number): Promise<Lesson | null> {
        return this.prismaService.lesson.findUnique({
            where: {
                id: lessonId,
                exerciseId: exerciseId,
                deletedAt: null,
            },
            include: {
                exercise: true,
                classroom: true,
            },
        });
    }

    async findUnique(data: { lessonId: number, studentId: number }): Promise<ExerciseSubmission | null> {
        return this.prismaService.exerciseSubmission.findUnique({
            where: {
                lessonId_studentId: {
                    lessonId: data.lessonId,
                    studentId: data.studentId,
                },
            },
        });
    }

    async findById(id: number): Promise<ExerciseSubmission | null> {
        return this.prismaService.exerciseSubmission.findUnique({
            where: { id },
        });
    }

    async delete(id: number): Promise<ExerciseSubmission> {
        return this.prismaService.exerciseSubmission.delete({
            where: { id },
        });
    }

    async findByLessonId(lessonId: number): Promise<(ExerciseSubmission & { media: Media, student: User })[]> {
        return this.prismaService.exerciseSubmission.findMany({
            where: { lessonId },
            include: {
                media: true,
                student: true,
            },
        });
    }

    async update(id: number, data: {
        score: number;
        comment?: string | null;
        gradedAt: Date;
    }): Promise<ExerciseSubmission & { media: Media, student: User }> {
        return this.prismaService.exerciseSubmission.update({
            where: { id },
            data: {
                score: data.score,
                comment: data.comment,
                gradedAt: data.gradedAt,
            },
            include: {
                media: true,
                student: true,
            },
        });
    }
}