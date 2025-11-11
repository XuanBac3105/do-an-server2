import { createZodDto } from 'nestjs-zod'
import { GetList } from 'src/shared/queries/get-list.query'
import z from 'zod'

export enum ExerciseSortBy {
    createdAt = 'createdAt',
    title = 'title',
}

export const GetListExercisesQuery = GetList.extend({
    sortBy: z.enum(ExerciseSortBy).default(ExerciseSortBy.createdAt),
})

export class GetListExercisesQueryDto extends createZodDto(GetListExercisesQuery) {}

export type GetListExercisesQueryType = z.infer<typeof GetListExercisesQuery>