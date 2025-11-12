import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DetachMediaFromQuestionOptionReqSchema = z.object({
    optionId: z
        .number({ message: 'Option ID phải là một số' })
        .int({ message: 'Option ID phải là một số nguyên' })
        .positive({ message: 'Option ID phải là một số nguyên dương' }),
    mediaIds: z
        .array(z.number().int().positive(), { message: 'Media IDs phải là một mảng các số nguyên dương' })
        .min(1, { message: 'Phải có ít nhất một media ID' }),
});

export class DetachMediaFromQuestionOptionReqDto extends createZodDto(DetachMediaFromQuestionOptionReqSchema) {}

export type DetachMediaFromQuestionOptionReqType = z.infer<typeof DetachMediaFromQuestionOptionReqSchema>;
