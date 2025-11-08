import { createZodDto } from 'nestjs-zod'
import { JoinreqSchema } from 'src/shared/models/join-request.model'
import z from 'zod'

export const JoinreqResSchema = JoinreqSchema

export class JoinreqResDto extends createZodDto(JoinreqResSchema) {}

export type JoinreqResType = z.infer<typeof JoinreqResSchema>
