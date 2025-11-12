import { createZodDto } from 'nestjs-zod'
import { GetList } from 'src/shared/queries/get-list.query'
import z from 'zod'

export enum QuizSortBy {
    createdAt = 'createdAt',
    title = 'title',
}

export const GetQuizzesQuery = GetList.extend({
    sortBy: z.enum(QuizSortBy).default(QuizSortBy.createdAt),
})

export class GetQuizzesQueryDto extends createZodDto(GetQuizzesQuery) {}

export type GetQuizzesQueryType = z.infer<typeof GetQuizzesQuery>
