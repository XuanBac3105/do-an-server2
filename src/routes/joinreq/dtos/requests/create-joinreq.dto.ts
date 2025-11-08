import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const CreateJoinreqReqSchema = z.object({
    classroomId: z
        .number({ message: 'Classroom ID phải là một số' })
        .int('Classroom ID phải là một số nguyên')
        .positive('Classroom ID phải là một số dương'),
})

export class CreateJoinreqReqDto extends createZodDto(CreateJoinreqReqSchema) {}

export type CreateJoinreqReqType = z.infer<typeof CreateJoinreqReqSchema>
