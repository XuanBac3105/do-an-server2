import { Injectable } from "@nestjs/common";
import { Classroom, ClassroomStudent, JoinRequest, Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/services/prisma.service";
import { ClassroomWithStdJreqDto } from "./classroom.dto";
import { ClassroomWithStdJreqType } from "./classroom.type";

@Injectable()
export class ClassroomRepo {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async count(where: Prisma.ClassroomWhereInput): Promise<number> {
        return this.prismaService.classroom.count({ where });
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
        });
    }

    async findClassroomWithStdJreq(id: number): Promise<ClassroomWithStdJreqType | null> {
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
                            }
                        }
                    }
                },
                classroomStudents: {
                    include: {
                        student: {
                            omit: {
                                passwordHash: true,
                                role: true,
                            }
                        }
                    }
                }
            },
        });
    }

    async create(data: { name: string; description?: string | null }): Promise<Classroom> {
        return this.prismaService.classroom.create({
            data,
        });
    }

    async update(data: Partial<Classroom>): Promise<Classroom> {
        return this.prismaService.classroom.update({
            where: { id: data.id },
            data,
        });
    }
}