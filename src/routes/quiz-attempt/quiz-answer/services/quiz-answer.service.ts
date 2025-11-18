import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { CreateQuizAnswerReqType } from '../dtos/requests/create-quiz-answer-req.dto';
import { QuizAnswerResType } from '../dtos/responses/quiz-answer-res.dto';
import { IQuizAnswerService } from './quiz-answer.interface.service';
import { ResponseMessage } from 'src/shared/types/response-message.type';
import type { IQuizAnswerRepo } from '../repos/quiz-answer.interface.repo';

@Injectable()
export class QuizAnswerService implements IQuizAnswerService {
    constructor(
        @Inject('IQuizAnswerRepo')
        private readonly quizAnswerRepo: IQuizAnswerRepo) {}

    private async verifyAttemptAccess(attemptId: number, userId: number) {
        const attempt = await this.quizAnswerRepo.findAttemptWithAnswers(attemptId);
        
        if (!attempt) {
            throw new NotFoundException('Không tìm thấy lần làm bài');
        }

        if (attempt.studentId !== userId) {
            throw new ForbiddenException('Bạn chỉ có quyền truy cập bài làm của mình');
        }

        if (attempt.status !== 'in_progress') {
            throw new BadRequestException('Không thể sửa bài đã nộp');
        }

        return attempt;
    }

    private calculateScore(answers: any[]): { earnedPoints: number; scoreScaled10: number } {
        const questionScores = [...answers
            .reduce((map, answer) => {
                if (!map.has(answer.questionId)) {
                    map.set(answer.questionId, {
                        points: answer.question.points,
                        hasCorrect: false
                    });
                }
                if (answer.option.isCorrect) {
                    map.get(answer.questionId)!.hasCorrect = true;
                }
                return map;
            }, new Map<number, { points: number; hasCorrect: boolean }>())
            .values()];

        const totalPoints = questionScores.reduce((sum, q) => sum + q.points, 0);
        const earnedPoints = questionScores.reduce((sum, q) => sum + (q.hasCorrect ? q.points : 0), 0);
        const scoreScaled10 = totalPoints > 0 ? (earnedPoints / totalPoints) * 10 : 0;

        return { earnedPoints, scoreScaled10 };
    }

    async upsertAnswer(userId: number, attemptId: number, data: CreateQuizAnswerReqType): Promise<QuizAnswerResType> {
        const attempt = await this.verifyAttemptAccess(attemptId, userId);

        // Xóa câu trả lời cũ nếu có (change answer)
        const existingAnswer = attempt.answers.find(a => a.questionId === data.questionId);
        if (existingAnswer) {
            await this.quizAnswerRepo.delete({
                attemptId: existingAnswer.attemptId,
                questionId: existingAnswer.questionId,
                optionId: existingAnswer.optionId,
            });
        }

        // Tạo câu trả lời mới
        await this.quizAnswerRepo.create({
            attemptId,
            questionId: data.questionId,
            optionId: data.optionId,
        });

        // Cập nhật điểm
        const updatedAttempt = await this.quizAnswerRepo.findAttemptWithAnswers(attemptId);
        const { earnedPoints, scoreScaled10 } = this.calculateScore(updatedAttempt!.answers);
        await this.quizAnswerRepo.updateAttemptScore(attemptId, earnedPoints, scoreScaled10);

        // Trả về answer vừa tạo
        const answers = await this.quizAnswerRepo.findMany({
            attemptId,
            questionId: data.questionId,
            optionId: data.optionId,
        });

        return answers[0];
    }

    async deleteAnswer(userId: number, attemptId: number, questionId: number): Promise<ResponseMessage> {
        const attempt = await this.verifyAttemptAccess(attemptId, userId);

        const existingAnswer = attempt.answers.find(a => a.questionId === questionId);
        
        if (!existingAnswer) {
            throw new NotFoundException('Không tìm thấy câu trả lời');
        }

        await this.quizAnswerRepo.delete({
            attemptId,
            questionId,
            optionId: existingAnswer.optionId,
        });

        // Cập nhật điểm
        const updatedAttempt = await this.quizAnswerRepo.findAttemptWithAnswers(attemptId);
        const { earnedPoints, scoreScaled10 } = this.calculateScore(updatedAttempt!.answers);
        await this.quizAnswerRepo.updateAttemptScore(attemptId, earnedPoints, scoreScaled10);

        return { message: 'Đã xóa câu trả lời' };
    }
}