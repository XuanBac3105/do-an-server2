import { createZodDto } from 'nestjs-zod'
import { CreateJoinreqReqSchema } from './create-joinreq.dto'
import z from 'zod'

export const LeaveClrSchema = CreateJoinreqReqSchema

export class LeaveClrDto extends createZodDto(LeaveClrSchema) {}

export type LeaveClrType = z.infer<typeof LeaveClrSchema>
