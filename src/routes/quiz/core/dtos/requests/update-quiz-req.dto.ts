import { createZodDto } from 'nestjs-zod'
import { CreateQuizReqSchema } from './create-quiz-req.dto'
import z from 'zod'

export const UpdateQuizReqShema = CreateQuizReqSchema.partial()

export class UpdateQuizReqDto extends createZodDto(UpdateQuizReqShema) {}

export type UpdateQuizReqType = z.infer<typeof UpdateQuizReqShema>
