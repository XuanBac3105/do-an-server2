import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AttachMediaToQuestionGroupReqSchema = z.object({
    groupId: z
        .number({ message: 'Group ID phải là một số' })
        .int({ message: 'Group ID phải là một số nguyên' })
        .positive({ message: 'Group ID phải là một số nguyên dương' }),
    mediaIds: z
        .array(z.number().int().positive(), { message: 'Media IDs phải là một mảng các số nguyên dương' })
        .min(1, { message: 'Phải có ít nhất một media ID' }),
});

export class AttachMediaToQuestionGroupReqDto extends createZodDto(AttachMediaToQuestionGroupReqSchema) {}

export type AttachMediaToQuestionGroupReqType = z.infer<typeof AttachMediaToQuestionGroupReqSchema>;
