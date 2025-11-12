import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DetachMediaFromQuestionGroupReqSchema = z.object({
    groupId: z
        .number({ message: 'Group ID phải là một số' })
        .int({ message: 'Group ID phải là một số nguyên' })
        .positive({ message: 'Group ID phải là một số nguyên dương' }),
    mediaIds: z
        .array(z.number().int().positive(), { message: 'Media IDs phải là một mảng các số nguyên dương' })
        .min(1, { message: 'Phải có ít nhất một media ID' }),
});

export class DetachMediaFromQuestionGroupReqDto extends createZodDto(DetachMediaFromQuestionGroupReqSchema) {}

export type DetachMediaFromQuestionGroupReqType = z.infer<typeof DetachMediaFromQuestionGroupReqSchema>;
