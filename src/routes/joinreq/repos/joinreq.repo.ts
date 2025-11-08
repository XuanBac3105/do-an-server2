import { Injectable } from '@nestjs/common'
import { JoinRequest, Prisma } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import { IJoinreqRepo } from './joinreq.interface.repo';

@Injectable()
export class JoinreqRepo implements IJoinreqRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async findById(id: number): Promise<JoinRequest | null> {
        return this.prismaService.joinRequest.findUnique({
            where: {
                id,
            },
        })
    }

    async findUnique(uniqueObject: { studentId: number; classroomId: number }): Promise<JoinRequest | null> {
        return this.prismaService.joinRequest.findFirst({
            where: {
                studentId: uniqueObject.studentId,
                classroomId: uniqueObject.classroomId,
            },
        })
    }

    async createJoinRequest(studentId: number, classroomId: number): Promise<JoinRequest> {
        return this.prismaService.joinRequest.create({
            data: {
                studentId,
                classroomId,
                status: 'pending',
                requestedAt: new Date(),
            },
        })
    }

    async update(data: Partial<JoinRequest>): Promise<JoinRequest> {
        return this.prismaService.joinRequest.update({
            where: {
                id: data.id,
            },
            data,
        })
    }

    async countClassrooms(where: Prisma.ClassroomWhereInput): Promise<number> {
        return this.prismaService.classroom.count({ where })
    }

    async findClassrooms(
        where: Prisma.ClassroomWhereInput,
        orderBy: Prisma.ClassroomOrderByWithRelationInput,
        skip: number,
        take: number,
        options?: {
            includeStudentInfo?: boolean
            studentId?: number
        },
    ): Promise<
        Array<
            Prisma.ClassroomGetPayload<{
                include: {
                    classroomStudents: true
                    joinRequests: true
                }
            }>
        >
    > {
        const include = options?.includeStudentInfo && options?.studentId
            ? {
                  classroomStudents: {
                      where: {
                          studentId: options.studentId,
                          isActive: true,
                          deletedAt: null,
                      },
                  },
                  joinRequests: {
                      where: {
                          studentId: options.studentId,
                      },
                  },
              }
            : undefined

        return this.prismaService.classroom.findMany({
            where,
            include,
            orderBy,
            skip,
            take,
        }) as any
    }
}
