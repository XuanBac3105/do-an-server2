import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IExerciseSubmissionService } from "./exercise-submission.interface.service";
import { SubmitExReqType } from "../dtos/requests/submit-ex-req.dto";
import { ExSubmissionResType } from "../dtos/responses/ex-submissson-res.dto";
import type { IExerciseSubmissionRepo } from "../repos/exercise-submisison.interface.repo";
import { SharedClrStdRepo } from "src/shared/repos/shared-clrstd.repo";
import { SharedMediaRepo } from "src/shared/repos/shared-media.repo";
import { GradeSubmissionReqType } from "../dtos/requests/grade-submission-req.dto";

@Injectable()
export class ExerciseSubmissionService implements IExerciseSubmissionService {
    constructor(
        @Inject('IExerciseSubmissionRepo')
        private readonly exerciseSubmissionRepo: IExerciseSubmissionRepo,
        private readonly sharedClrStdRepo: SharedClrStdRepo,
        private readonly sharedMediaRepo: SharedMediaRepo,
    ) { }

    async submit(studentId: number, data: SubmitExReqType): Promise<ExSubmissionResType> {
        const lesson = await this.exerciseSubmissionRepo.findLessonExerciseById(data.lessonId, data.exerciseId);

        if (!lesson) { throw new NotFoundException("Bài học không tồn tại") }

        const classroomStudent = await this.sharedClrStdRepo.findUnique({
            classroomId: lesson.classroomId,
            studentId: studentId,
        });
        if (!classroomStudent) { throw new BadRequestException("Bạn không phải là học sinh của lớp học này") }
        if (!classroomStudent.isActive || classroomStudent.deletedAt) { throw new BadRequestException("Bạn đã bị chặn hoặc xóa khỏi lớp học này") }

        const media = await this.sharedMediaRepo.findById(data.mediaId)
        if (!media) { throw new NotFoundException("File nộp bài không tồn tại") }

        const existingSubmission = await this.exerciseSubmissionRepo.findUnique({
            lessonId: data.lessonId,
            studentId: studentId,
        })
        if (existingSubmission) { throw new BadRequestException("Bạn đã nộp bài tập này rồi") }

        const submission = await this.exerciseSubmissionRepo.create({
            lessonId: data.lessonId,
            exerciseId: lesson.exerciseId!,
            studentId: studentId,
            mediaId: data.mediaId,
        })

        return {
            id: submission.id,
            lessonId: submission.lessonId,
            exerciseId: submission.exerciseId,
            studentId: submission.studentId,
            mediaId: submission.mediaId,
            submittedAt: submission.submittedAt,
            score: submission.score ? Number(submission.score) : null,
            comment: submission.comment,
            gradedAt: submission.gradedAt,
            media: {
                id: submission.media.id,
                disk: submission.media.disk,
                bucket: submission.media.bucket,
                objectKey: submission.media.objectKey,
                mimeType: submission.media.mimeType,
                sizeBytes: submission.media.sizeBytes ? Number(submission.media.sizeBytes) : null,
                visibility: submission.media.visibility,
                uploadedBy: submission.media.uploadedBy,
                createdAt: submission.media.createdAt,
                deletedAt: submission.media.deletedAt,
            },
        };
    }

    async deleteSubmission(studentId: number, submissionId: number): Promise<{ message: string }> {
        const submission = await this.exerciseSubmissionRepo.findById(submissionId);
        
        if (!submission) {
            throw new NotFoundException("Bài nộp không tồn tại");
        }

        if (submission.studentId !== studentId) {
            throw new ForbiddenException("Bạn không có quyền xóa bài nộp này");
        }

        await this.exerciseSubmissionRepo.delete(submissionId);

        return { message: "Xóa bài nộp thành công" };
    }

    async getSubmissionsByLessonId(lessonId: number): Promise<ExSubmissionResType[]> {
        const submissions = await this.exerciseSubmissionRepo.findByLessonId(lessonId);

        return submissions.map(submission => ({
            id: submission.id,
            lessonId: submission.lessonId,
            exerciseId: submission.exerciseId,
            studentId: submission.studentId,
            mediaId: submission.mediaId,
            submittedAt: submission.submittedAt,
            score: submission.score ? Number(submission.score) : null,
            comment: submission.comment,
            gradedAt: submission.gradedAt,
            media: {
                id: submission.media.id,
                disk: submission.media.disk,
                bucket: submission.media.bucket,
                objectKey: submission.media.objectKey,
                mimeType: submission.media.mimeType,
                sizeBytes: submission.media.sizeBytes ? Number(submission.media.sizeBytes) : null,
                visibility: submission.media.visibility,
                uploadedBy: submission.media.uploadedBy,
                createdAt: submission.media.createdAt,
                deletedAt: submission.media.deletedAt,
            },
            student: {
                id: submission.student.id,
                fullName: submission.student.fullName,
                email: submission.student.email,
                phoneNumber: submission.student.phoneNumber,
                role: submission.student.role,
                avatarMediaId: submission.student.avatarMediaId,
                isActive: submission.student.isActive,
                createdAt: submission.student.createdAt,
                updatedAt: submission.student.updatedAt,
            },
        }));
    }

    async gradeSubmission(submissionId: number, data: GradeSubmissionReqType): Promise<ExSubmissionResType> {
        const submission = await this.exerciseSubmissionRepo.findById(submissionId);
        
        if (!submission) {
            throw new NotFoundException("Bài nộp không tồn tại");
        }

        const updatedSubmission = await this.exerciseSubmissionRepo.update(submissionId, {
            score: data.score,
            comment: data.comment,
            gradedAt: new Date(),
        });

        return {
            id: updatedSubmission.id,
            lessonId: updatedSubmission.lessonId,
            exerciseId: updatedSubmission.exerciseId,
            studentId: updatedSubmission.studentId,
            mediaId: updatedSubmission.mediaId,
            submittedAt: updatedSubmission.submittedAt,
            score: updatedSubmission.score ? Number(updatedSubmission.score) : null,
            comment: updatedSubmission.comment,
            gradedAt: updatedSubmission.gradedAt,
            media: {
                id: updatedSubmission.media.id,
                disk: updatedSubmission.media.disk,
                bucket: updatedSubmission.media.bucket,
                objectKey: updatedSubmission.media.objectKey,
                mimeType: updatedSubmission.media.mimeType,
                sizeBytes: updatedSubmission.media.sizeBytes ? Number(updatedSubmission.media.sizeBytes) : null,
                visibility: updatedSubmission.media.visibility,
                uploadedBy: updatedSubmission.media.uploadedBy,
                createdAt: updatedSubmission.media.createdAt,
                deletedAt: updatedSubmission.media.deletedAt,
            },
            student: {
                id: updatedSubmission.student.id,
                fullName: updatedSubmission.student.fullName,
                email: updatedSubmission.student.email,
                phoneNumber: updatedSubmission.student.phoneNumber,
                role: updatedSubmission.student.role,
                avatarMediaId: updatedSubmission.student.avatarMediaId,
                isActive: updatedSubmission.student.isActive,
                createdAt: updatedSubmission.student.createdAt,
                updatedAt: updatedSubmission.student.updatedAt,
            },
        };
    }
}
