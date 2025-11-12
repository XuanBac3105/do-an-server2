import z from 'zod'
import { QuizSchema } from '../responses/quiz-res.dto'
import { createZodDto } from 'nestjs-zod'

export const CreateQuizReqSchema = QuizSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
})

export class CreateQuizReqDto extends createZodDto(CreateQuizReqSchema) {}

export type CreateQuizReqType = z.infer<typeof CreateQuizReqSchema>
