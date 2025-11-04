import { SharedClassroomRepo } from './../../shared/repos/shared-classroom.repo';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ClassroomRepo } from './classroom.repo';
import { Prisma } from '@prisma/client';
import { buildListResponse, buildOrderBy, buildSearchFilter, calculatePagination } from 'src/shared/utils/query.util';
import { ResponseMessage } from 'src/shared/types/response-message.type';
import {
    ClassroomWithStdJreqDto,
    GetListClassroomsQueryDto,
    ListClassroomsResDto,
    UpdateClassroomReqDto
} from './classroom.dto';

@Injectable()
export class ClassroomService {
    constructor(
        private readonly classroomRepo: ClassroomRepo,
        private readonly sharedClassroomRepo: SharedClassroomRepo
    ) { }

    async getAllClassrooms(query: GetListClassroomsQueryDto): Promise<ListClassroomsResDto> {
        const { page, limit, order, search, isArchived, sortBy } = query;

        const where: Prisma.ClassroomWhereInput = {
            deletedAt: null,
            ...(typeof isArchived === 'boolean' && { isArchived }),
            ...(buildSearchFilter(search, ['name', 'description']))
        };

        const orderBy = buildOrderBy(sortBy, order);

        const { skip, take } = calculatePagination(page, limit);

        const [total, data] = await Promise.all([
            this.classroomRepo.count(where),
            this.classroomRepo.findMany(where, orderBy, skip, take),
        ]);

        return buildListResponse(page, limit, total, data);
    }


    async getClassroomById(id: number): Promise<ClassroomWithStdJreqDto> {
        const classroom = await this.classroomRepo.findClassroomWithStdJreq(id);
        if (!classroom) {
            throw new UnprocessableEntityException('Lớp học không tồn tại');
        }
        return classroom;
    }

    async createClassroom(data: UpdateClassroomReqDto) {
        const existingClassroom = await this.sharedClassroomRepo.findUnique({ name: data.name });
        if (existingClassroom) {
            throw new UnprocessableEntityException('Tên lớp học đã tồn tại');
        }
        return this.classroomRepo.create(data);
    }

    async updateClassroom(id: number, data: UpdateClassroomReqDto) {
        const classroom = await this.sharedClassroomRepo.findUnique({ id });
        if (!classroom || classroom.deletedAt) {
            throw new UnprocessableEntityException('Lớp học không tồn tại');
        }
        const existingClassroom = await this.sharedClassroomRepo.findUnique({ name: data.name });
        if (existingClassroom && existingClassroom.id !== id) {
            throw new UnprocessableEntityException('Tên lớp học đã tồn tại');
        }
         
        return this.classroomRepo.update({ id, ...data });
    }

    async deleteClassroom(id: number): Promise<ResponseMessage> {
        const classroom = await this.sharedClassroomRepo.findUnique({ id });
        if (!classroom) {
            throw new UnprocessableEntityException('Lớp học không tồn tại');
        }
        await this.classroomRepo.update({ id, deletedAt: new Date() });
        return { message: 'Xóa lớp học thành công' };
    }

    async getDeletedClassrooms(query: GetListClassroomsQueryDto): Promise<ListClassroomsResDto> {
        const { page, limit, order, search, sortBy } = query;

        const where: Prisma.ClassroomWhereInput = {
            deletedAt: { not: null },
            ...(buildSearchFilter(search, ['name', 'description']))
        };
        const orderBy = buildOrderBy(sortBy, order);

        const { skip, take } = calculatePagination(page, limit);
        const [total, data] = await Promise.all([
            this.classroomRepo.count(where),
            this.classroomRepo.findMany(where, orderBy, skip, take),
        ]);

        return buildListResponse(page, limit, total, data);
    }

    async restoreClassroom(id: number) {
        const classroom = await this.sharedClassroomRepo.findUnique({ id });
        if (!classroom || !classroom.deletedAt) {
            throw new UnprocessableEntityException('Lớp học không tồn tại');
        }
        return this.classroomRepo.update({ id, deletedAt: null });
    }
}