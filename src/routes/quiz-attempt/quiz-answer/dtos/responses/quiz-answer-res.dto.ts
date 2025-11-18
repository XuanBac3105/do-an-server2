import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { QuestionSchema } from 'src/routes/quiz/question/dtos/responses/question-res.dto';
import { QuestionOptionSchema } from 'src/routes/quiz/question-option/dtos/responses/question-option-res.dto';

export const QuizAnswerSchema = z.object({
    attemptId: z
        .number({ message: 'Attempt ID phải là một số' })
        .int({ message: 'Attempt ID phải là một số nguyên' })
        .positive({ message: 'Attempt ID phải là một số nguyên dương' }),
    questionId: z
        .number({ message: 'Question ID phải là một số' })
        .int({ message: 'Question ID phải là một số nguyên' })
        .positive({ message: 'Question ID phải là một số nguyên dương' }),
    optionId: z
        .number({ message: 'Option ID phải là một số' })
        .int({ message: 'Option ID phải là một số nguyên' })
        .positive({ message: 'Option ID phải là một số nguyên dương' }),
    question: QuestionSchema,
    option: QuestionOptionSchema,
});

export class QuizAnswerResDto extends createZodDto(QuizAnswerSchema) {}
export type QuizAnswerResType = z.infer<typeof QuizAnswerSchema>;
