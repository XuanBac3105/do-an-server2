import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, Lecture } from '@prisma/client'
import { buildListResponse, buildOrderBy, buildSearchFilter, calculatePagination } from 'src/shared/utils/query.util'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { LectureResDto } from '../dtos/responses/lecture-res.dto'
import { CreateLectureReqType } from '../dtos/requests/create-lecture-req.dto'
import { GetListLecturesQueryType } from '../dtos/queries/get-lectures.dto'
import { ListLecturesResType } from '../dtos/responses/list-lectures-res.dto'
import { UpdateLectureReqType } from '../dtos/requests/update-lecture-req.dto'
import type { ILectureRepo } from '../repos/lecture.interface.repo'
import { ILectureService } from './lecture.interface.service'

@Injectable()
export class LectureService implements ILectureService {
    constructor(@Inject('ILectureRepo') private readonly lectureRepo: ILectureRepo) {}

    async createLecture(data: CreateLectureReqType): Promise<Lecture> {
        const lecture = await this.lectureRepo.create({
            parentId: data.parentId ?? null,
            title: data.title,
            content: data.content ?? null,
            mediaId: data.mediaId ?? null,
        })
        return lecture
    }

    async getLectureList(query: GetListLecturesQueryType): Promise<ListLecturesResType> {
        const { page, limit, search, order, sortBy } = query

        const where: Prisma.LectureWhereInput = {
            deletedAt: null,
            ...buildSearchFilter(search, ['title']),
        }

        const orderBy = buildOrderBy(sortBy, order)

        const { skip, take } = calculatePagination(page, limit)

        const [total, data] = await Promise.all([
            this.lectureRepo.count(where),
            this.lectureRepo.findMany(where, orderBy, skip, take),
        ])

        const lecturesWithoutContent = data.map(({ content, ...lecture }) => lecture)

        return buildListResponse(page, limit, total, lecturesWithoutContent)
    }

    async getLectureById(id: number): Promise<Lecture> {
        const lecture = await this.lectureRepo.findById(id)
        if (!lecture) {
            throw new NotFoundException(`Không tìm thấy bài giảng với ID ${id}`)
        }
        return lecture
    }

    async updateLecture(id: number, data: UpdateLectureReqType): Promise<Lecture> {
        const existingLecture = await this.lectureRepo.findById(id)

        if (!existingLecture) {
            throw new NotFoundException(`Không tìm thấy bài giảng với ID ${id}`)
        }

        const lecture = await this.lectureRepo.update(id, data)
        return lecture
    }

    async deleteLecture(id: number): Promise<ResponseMessage> {
        const existingLecture = await this.lectureRepo.findById(id)
        if (!existingLecture) {
            throw new NotFoundException(`Không tìm thấy bài giảng với ID ${id}`)
        }
        await this.lectureRepo.softDelete(id)
        return { message: 'Xóa bài giảng thành công' }
    }
}
