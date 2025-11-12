import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DetachMediaFromQuestionReqSchema = z.object({
    questionId: z
        .number({ message: 'Question ID phải là một số' })
        .int({ message: 'Question ID phải là một số nguyên' })
        .positive({ message: 'Question ID phải là một số nguyên dương' }),
    mediaIds: z
        .array(z.number().int().positive(), { message: 'Media IDs phải là một mảng các số nguyên dương' })
        .min(1, { message: 'Phải có ít nhất một media ID' }),
});

export class DetachMediaFromQuestionReqDto extends createZodDto(DetachMediaFromQuestionReqSchema) {}

export type DetachMediaFromQuestionReqType = z.infer<typeof DetachMediaFromQuestionReqSchema>;
