import { Injectable } from '@nestjs/common'
import { Classroom, Prisma } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ClrWithStdJreqType } from '../dtos/responses/clr-with-std-and-jreq.dto'
import { IClassroomRepo } from './classroom.interface.repo'

@Injectable()
export class ClassroomRepo implements IClassroomRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async count(where: Prisma.ClassroomWhereInput): Promise<number> {
        return this.prismaService.classroom.count({ where })
    }

    async findMany(
        where: Prisma.ClassroomWhereInput,
        orderBy: Prisma.ClassroomOrderByWithRelationInput,
        skip: number,
        take: number,
    ): Promise<Classroom[]> {
        return this.prismaService.classroom.findMany({
            where,
            orderBy,
            skip,
            take,
        })
    }

    async findClassroomWithStdJreq(id: number): Promise<ClrWithStdJreqType | null> {
        return this.prismaService.classroom.findUnique({
            where: { id },
            include: {
                joinRequests: {
                    where: { status: 'pending' },
                    include: {
                        student: {
                            omit: {
                                passwordHash: true,
                                role: true,
                            },
                        },
                    },
                },
                classroomStudents: {
                    where: { deletedAt: null },
                    include: {
                        student: {
                            omit: {
                                passwordHash: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        })
    }

    async create(data: { name: string; description?: string | null }): Promise<Classroom> {
        return this.prismaService.classroom.create({
            data,
        })
    }

    async update(data: Partial<Classroom>): Promise<Classroom> {
        return this.prismaService.classroom.update({
            where: { id: data.id },
            data,
        })
    }
}
