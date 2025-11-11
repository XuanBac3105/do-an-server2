import { Exercise } from '@prisma/client'
import { CreateExerciseReqType } from '../dtos/requests/create-exercise-req.dto'
import { GetListExercisesQueryType } from '../dtos/queries/get-exercises.dto'
import { ListExercisesResType } from '../dtos/responses/list-exercises-res.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type'

export interface IExerciseService {
    create(data: CreateExerciseReqType): Promise<Exercise>
    getAll(data: GetListExercisesQueryType): Promise<ListExercisesResType>
    getById(id: number): Promise<Exercise>
    update(id: number, data: Partial<CreateExerciseReqType>): Promise<Exercise>
    delete(id: number): Promise<ResponseMessage>
}
