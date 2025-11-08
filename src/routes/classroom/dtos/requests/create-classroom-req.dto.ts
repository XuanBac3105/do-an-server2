import { createZodDto } from 'nestjs-zod'
import { ClassroomSchema } from 'src/shared/models/classroom-res.model'
import z from 'zod'

export const CreateClassroomReqSchema = ClassroomSchema.pick({
    name: true,
    description: true,
})

export class CreateClassroomReqDto extends createZodDto(CreateClassroomReqSchema) {}

export type CreateClassroomReqType = z.infer<typeof CreateClassroomReqSchema>
