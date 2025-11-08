import { Injectable } from '@nestjs/common'
import { Prisma, Lecture } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ILectureRepo } from './lecture.interface.repo'

@Injectable()
export class LectureRepo implements ILectureRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async count(where: Prisma.LectureWhereInput): Promise<number> {
        return this.prismaService.lecture.count({ where })
    }

    async findMany(
        where: Prisma.LectureWhereInput,
        orderBy: Prisma.LectureOrderByWithRelationInput,
        skip: number,
        take: number,
    ): Promise<Lecture[]> {
        return this.prismaService.lecture.findMany({
            where,
            orderBy,
            skip,
            take,
        })
    }

    async findById(id: number): Promise<Lecture | null> {
        return this.prismaService.lecture.findUnique({
            where: {
                id,
                deletedAt: null,
            },
        })
    }

    async create(data: {
        parentId?: number | null
        title: string
        content: string | null
        mediaId: number | null
    }): Promise<Lecture> {
        return this.prismaService.lecture.create({
            data,
        })
    }

    async update(
        id: number,
        data: {
            parentId?: number | null
            title?: string
            content?: string | null
            mediaId?: number | null
        },
    ): Promise<Lecture> {
        return this.prismaService.lecture.update({
            where: {
                id,
                deletedAt: null,
            },
            data,
        })
    }

    async softDelete(id: number): Promise<Lecture> {
        return this.prismaService.lecture.update({
            where: {
                id,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
            },
        })
    }
}
