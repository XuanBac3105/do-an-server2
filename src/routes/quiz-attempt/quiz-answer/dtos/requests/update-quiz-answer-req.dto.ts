import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UpdateQuizAnswerSchema = z.object({
    optionId: z
        .number({ message: 'Option ID phải là một số' })
        .int({ message: 'Option ID phải là một số nguyên' })
        .positive({ message: 'Option ID phải là một số nguyên dương' }),
});

export class UpdateQuizAnswerReqDto extends createZodDto(UpdateQuizAnswerSchema) {}
export type UpdateQuizAnswerReqType = z.infer<typeof UpdateQuizAnswerSchema>;
