import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AttachMediaToQuestionOptionReqSchema = z.object({
    optionId: z
        .number({ message: 'Option ID phải là một số' })
        .int({ message: 'Option ID phải là một số nguyên' })
        .positive({ message: 'Option ID phải là một số nguyên dương' }),
    mediaIds: z
        .array(z.number().int().positive(), { message: 'Media IDs phải là một mảng các số nguyên dương' })
        .min(1, { message: 'Phải có ít nhất một media ID' }),
});

export class AttachMediaToQuestionOptionReqDto extends createZodDto(AttachMediaToQuestionOptionReqSchema) {}

export type AttachMediaToQuestionOptionReqType = z.infer<typeof AttachMediaToQuestionOptionReqSchema>;
