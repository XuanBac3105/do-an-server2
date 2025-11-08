import { SharedClassroomRepo } from 'src/shared/repos/shared-classroom.repo'
import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { Classroom, Prisma } from '@prisma/client'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { buildListResponse, buildOrderBy, buildSearchFilter, calculatePagination } from 'src/shared/utils/query.util'
import { ListClassroomsResType } from 'src/shared/types/list-classrooms-res.type'
import { ClrWithStdJreqType } from '../dtos/responses/clr-with-std-and-jreq.dto'
import { UpdateClassroomReqType } from '../dtos/requests/update-classroom-req.dto'
import type { IClassroomRepo } from '../repos/classroom.interface.repo'
import { GetClassroomsQueryType } from '../dtos/queries/get-classrooms.dto'
import { IClassroomService } from './classroom.interface.service'

@Injectable()
export class ClassroomService implements IClassroomService {
    constructor(
        @Inject('IClassroomRepo') private readonly classroomRepo: IClassroomRepo,
        private readonly sharedClassroomRepo: SharedClassroomRepo,
    ) {}

    async getAllClassrooms(query: GetClassroomsQueryType): Promise<ListClassroomsResType> {
        const { page, limit, order, search, isArchived, sortBy } = query

        const where: Prisma.ClassroomWhereInput = {
            deletedAt: null,
            ...(typeof isArchived === 'boolean' && { isArchived }),
            ...buildSearchFilter(search, ['name', 'description']),
        }

        const orderBy = buildOrderBy(sortBy, order)

        const { skip, take } = calculatePagination(page, limit)

        const [total, data] = await Promise.all([
            this.classroomRepo.count(where),
            this.classroomRepo.findMany(where, orderBy, skip, take),
        ])

        return buildListResponse(page, limit, total, data)
    }

    async getClassroomById(id: number): Promise<ClrWithStdJreqType> {
        const classroom = await this.classroomRepo.findClassroomWithStdJreq(id)
        if (!classroom) {
            throw new UnprocessableEntityException('Lớp học không tồn tại')
        }
        return classroom
    }

    async createClassroom(data: UpdateClassroomReqType): Promise<Classroom> {
        const existingClassroom = await this.sharedClassroomRepo.findUnique({ name: data.name })
        if (existingClassroom) {
            throw new UnprocessableEntityException('Tên lớp học đã tồn tại')
        }
        return this.classroomRepo.create(data)
    }

    async updateClassroom(id: number, data: UpdateClassroomReqType): Promise<Classroom> {
        const classroom = await this.sharedClassroomRepo.findUnique({ id })
        if (!classroom || classroom.deletedAt) {
            throw new UnprocessableEntityException('Lớp học không tồn tại')
        }
        const existingClassroom = await this.sharedClassroomRepo.findUnique({ name: data.name })
        if (existingClassroom && existingClassroom.id !== id) {
            throw new UnprocessableEntityException('Tên lớp học đã tồn tại')
        }

        return this.classroomRepo.update({ id, ...data })
    }

    async deleteClassroom(id: number): Promise<ResponseMessage> {
        const classroom = await this.sharedClassroomRepo.findUnique({ id })
        if (!classroom) {
            throw new UnprocessableEntityException('Lớp học không tồn tại')
        }
        await this.classroomRepo.update({ id, deletedAt: new Date() })
        return { message: 'Xóa lớp học thành công' }
    }

    async getDeletedClassrooms(query: GetClassroomsQueryType): Promise<ListClassroomsResType> {
        const { page, limit, order, search, sortBy } = query

        const where: Prisma.ClassroomWhereInput = {
            deletedAt: { not: null },
            ...buildSearchFilter(search, ['name', 'description']),
        }
        const orderBy = buildOrderBy(sortBy, order)

        const { skip, take } = calculatePagination(page, limit)
        const [total, data] = await Promise.all([
            this.classroomRepo.count(where),
            this.classroomRepo.findMany(where, orderBy, skip, take),
        ])

        return buildListResponse(page, limit, total, data)
    }

    async restoreClassroom(id: number): Promise<Classroom> {
        const classroom = await this.sharedClassroomRepo.findUnique({ id })
        if (!classroom || !classroom.deletedAt) {
            throw new UnprocessableEntityException('Lớp học không tồn tại')
        }
        return this.classroomRepo.update({ id, deletedAt: null })
    }
}
