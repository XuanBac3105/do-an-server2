import { JoinreqWithStudentSchema } from 'src/shared/models/join-request.model'
import { ClassroomSchema } from 'src/shared/models/classroom-res.model'
import { ClrStdWithStudentSchema } from 'src/shared/models/classroom-student.model'
import z from 'zod'
import { createZodDto } from 'nestjs-zod'

export const ClrWithStdJreqSchema = ClassroomSchema.extend({
    joinRequests: z.array(JoinreqWithStudentSchema),
    classroomStudents: z.array(ClrStdWithStudentSchema),
})
export class ClrWithStdJreqDto extends createZodDto(ClrWithStdJreqSchema) {}
export type ClrWithStdJreqType = z.infer<typeof ClrWithStdJreqSchema>
