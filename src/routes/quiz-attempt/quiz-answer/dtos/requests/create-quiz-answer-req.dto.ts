import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreateQuizAnswerSchema = z.object({
    questionId: z
        .number({ message: 'Question ID phải là một số' })
        .int({ message: 'Question ID phải là một số nguyên' })
        .positive({ message: 'Question ID phải là một số nguyên dương' }),
    optionId: z
        .number({ message: 'Option ID phải là một số' })
        .int({ message: 'Option ID phải là một số nguyên' })
        .positive({ message: 'Option ID phải là một số nguyên dương' }),
});

export class CreateQuizAnswerReqDto extends createZodDto(CreateQuizAnswerSchema) {}
export type CreateQuizAnswerReqType = z.infer<typeof CreateQuizAnswerSchema>;