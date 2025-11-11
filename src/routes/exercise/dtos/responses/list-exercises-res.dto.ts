import { BaseListResponse } from 'src/shared/models/base-list-response.model'
import z from 'zod'
import { ExerciseSchema } from './exercise-res.dto'
import { createZodDto } from 'nestjs-zod'

export const ListExercisesResWSchema = BaseListResponse.extend({
    data: z.array(ExerciseSchema),
})

export class ListExercisesResDto extends createZodDto(ListExercisesResWSchema) {}

export type ListExercisesResType = z.infer<typeof ListExercisesResWSchema>