import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const QuizAnswerParamSchema = z.object({
    attemptId: z.coerce
        .number({ message: 'Attempt ID không hợp lệ' })
        .int({ message: 'Attempt ID phải là số nguyên' })
        .positive({ message: 'Attempt ID phải là số nguyên dương' }),
    questionId: z.coerce
        .number({ message: 'Question ID không hợp lệ' })
        .int({ message: 'Question ID phải là số nguyên' })
        .positive({ message: 'Question ID phải là số nguyên dương' }),
});

export const QuizAnswerAttemptParamSchema = z.object({
    attemptId: z.coerce
        .number({ message: 'Attempt ID không hợp lệ' })
        .int({ message: 'Attempt ID phải là số nguyên' })
        .positive({ message: 'Attempt ID phải là số nguyên dương' }),
});

export class QuizAnswerParamDto extends createZodDto(QuizAnswerParamSchema) {}
export class QuizAnswerAttemptParamDto extends createZodDto(QuizAnswerAttemptParamSchema) {}
