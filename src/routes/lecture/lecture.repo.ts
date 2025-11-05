import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";
import { Lecture } from "@prisma/client";
import { buildSearchFilter, calculatePagination } from "src/shared/utils/query.util";

@Injectable()
export class LectureRepo {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async create(data: {
        parentId?: number | null,
        title: string,
        content: string | null,
        mediaId: number | null
    }): Promise<Lecture> {
        const lecture = await this.prismaService.lecture.create({
            data
        });
        return lecture;
    }

    async findAll(): Promise<Lecture[]> {
        const lectures = await this.prismaService.lecture.findMany({
            where: {
                deletedAt: null
            },
            orderBy: [
                { parentId: 'asc' },
                { id: 'asc' }
            ]
        });
        return lectures;
    }

    async findManyWithPagination(params: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<{ data: Lecture[]; total: number }> {
        const { page, limit, search } = params;
        const { skip, take } = calculatePagination(page, limit);

        const where = {
            deletedAt: null,
            ...buildSearchFilter(search, ['title'])
        };

        const [data, total] = await Promise.all([
            this.prismaService.lecture.findMany({
                where,
                skip,
                take,
                orderBy: [
                    { id: 'asc' }
                ]
            }),
            this.prismaService.lecture.count({ where })
        ]);

        return { data, total };
    }

    async findById(id: number): Promise<Lecture | null> {
        const lecture = await this.prismaService.lecture.findUnique({
            where: {
                id,
                deletedAt: null
            }
        });
        return lecture;
    }

    async update(id: number, data: {
        parentId?: number | null,
        title?: string,
        content?: string | null,
        mediaId?: number | null
    }): Promise<Lecture> {
        const lecture = await this.prismaService.lecture.update({
            where: {
                id,
                deletedAt: null
            },
            data
        });
        return lecture;
    }

    async softDelete(id: number): Promise<Lecture> {
        const lecture = await this.prismaService.lecture.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                deletedAt: new Date()
            }
        });
        return lecture;
    }
}