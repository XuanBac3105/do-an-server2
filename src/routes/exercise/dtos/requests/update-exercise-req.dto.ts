import z from 'zod'
import { CreateExerciseSchema } from './create-exercise-req.dto'
import { createZodDto } from 'nestjs-zod'

export const UpdateExerciseSchema = CreateExerciseSchema.partial()

export class UpdateExerciseReqDto extends createZodDto(UpdateExerciseSchema) {}

export type UpdateExerciseReqType = z.infer<typeof UpdateExerciseSchema>