import { createZodDto } from 'nestjs-zod'
import { QuizSchema } from './quiz-res.dto'
import { BaseListResponse } from 'src/shared/models/base-list-response.model'
import z from 'zod'

export const ListQuizzesResSchema = BaseListResponse.extend({
    data: z.array(QuizSchema),
})

export class ListQuizzesResDto extends createZodDto(ListQuizzesResSchema) {}

export type ListQuizzesResType = z.infer<typeof ListQuizzesResSchema>
