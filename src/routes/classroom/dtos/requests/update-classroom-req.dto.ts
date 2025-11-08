import { createZodDto } from 'nestjs-zod'
import { ClassroomSchema } from '../../../../shared/models/classroom-res.model'
import z from 'zod'

export const UpdateClassroomReqSchema = ClassroomSchema.pick({
    name: true,
    isArchived: true,
    description: true,
})

export class UpdateClassroomReqDto extends createZodDto(UpdateClassroomReqSchema) {}

export type UpdateClassroomReqType = z.infer<typeof UpdateClassroomReqSchema>
