import { createZodDto } from 'nestjs-zod'
import { ExerciseSchema } from '../responses/exercise-res.dto'
import z from 'zod'

export const CreateExerciseSchema = ExerciseSchema.pick({
    title: true,
    description: true,
    attachMediaId: true,
})

export class CreateExerciseReqDto extends createZodDto(CreateExerciseSchema) {}

export type CreateExerciseReqType = z.infer<typeof CreateExerciseSchema>