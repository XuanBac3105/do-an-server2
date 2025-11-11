import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { IExerciseService } from './exercise.interface.service'
import { CreateExerciseReqType } from '../dtos/requests/create-exercise-req.dto'
import { Exercise, Prisma } from '@prisma/client'
import type { IExerciseRepo } from '../repos/exercise.interface.repo'
import { GetListExercisesQueryType } from '../dtos/queries/get-exercises.dto'
import { ListExercisesResType } from '../dtos/responses/list-exercises-res.dto'
import { buildSearchFilter, buildOrderBy, calculatePagination, buildListResponse } from 'src/shared/utils/query.util'
import { ResponseMessage } from 'src/shared/types/response-message.type'

@Injectable()
export class ExerciseService implements IExerciseService {
    constructor(
        @Inject('IExerciseRepo')
        private readonly exerciseRepo: IExerciseRepo,
    ) {}

    async create(data: CreateExerciseReqType): Promise<Exercise> {
        return this.exerciseRepo.create({
            title: data.title,
            description: data.description ?? undefined,
            attachMediaId: data.attachMediaId ?? undefined,
        })
    }

    async getAll(query: GetListExercisesQueryType): Promise<ListExercisesResType> {
        const { page, limit, order, search, sortBy } = query

        const where: Prisma.ExerciseWhereInput = {
            deletedAt: null,
            ...buildSearchFilter(search, ['title', 'description']),
        }

        const orderBy = buildOrderBy(sortBy, order)

        const { skip, take } = calculatePagination(page, limit)

        const [total, data] = await Promise.all([
            this.exerciseRepo.count(where),
            this.exerciseRepo.findMany(where, orderBy, skip, take),
        ])
        return buildListResponse(page, limit, total, data)
    }

    async getById(id: number): Promise<Exercise> {
        const exercise = await this.exerciseRepo.findById(id)
        if (!exercise || exercise.deletedAt !== null) {
            throw new UnprocessableEntityException('Không tìm thấy bài tập')
        }
        return exercise
    }

    async update(id: number, data: Partial<CreateExerciseReqType>): Promise<Exercise> {
        const exercise = await this.exerciseRepo.findById(id)
        if (!exercise || exercise.deletedAt !== null) {
            throw new UnprocessableEntityException('Không tìm thấy bài tập')
        }
        return this.exerciseRepo.update(id, data)
    }

    async delete(id: number): Promise<ResponseMessage> {
        const exercise = await this.exerciseRepo.findById(id)
        if (!exercise || exercise.deletedAt !== null) {
            throw new UnprocessableEntityException('Không tìm thấy bài tập')
        }
        await this.exerciseRepo.update(id, { deletedAt: new Date() })
        return { message: 'Xóa bài tập thành công' }
    }
}