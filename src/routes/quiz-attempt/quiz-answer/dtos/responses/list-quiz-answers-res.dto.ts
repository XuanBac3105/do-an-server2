import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { QuizAnswerSchema } from './quiz-answer-res.dto';

export const ListQuizAnswersResSchema = z.object({
    data: z
        .array(QuizAnswerSchema, { message: 'Danh sách câu trả lời phải là một mảng' }),
    total: z
        .number({ message: 'Tổng số phải là một số' })
        .int({ message: 'Tổng số phải là một số nguyên' })
        .nonnegative({ message: 'Tổng số phải là một số không âm' }),
});

export class ListQuizAnswersResDto extends createZodDto(ListQuizAnswersResSchema) {}
export type ListQuizAnswersResType = z.infer<typeof ListQuizAnswersResSchema>;
