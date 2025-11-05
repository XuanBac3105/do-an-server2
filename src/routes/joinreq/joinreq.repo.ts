import { Injectable } from "@nestjs/common";
import { JoinRequest } from "@prisma/client";
import { PrismaService } from "src/shared/services/prisma.service";

@Injectable()
export class JoinreqRepo {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async findById(id: number): Promise<JoinRequest | null> {
        return this.prismaService.joinRequest.findUnique({
            where: {
                id,
            }
        });
    }

    async find({ studentId, classroomId }: { studentId: number; classroomId: number; }): Promise<JoinRequest | null> {
        return this.prismaService.joinRequest.findFirst({
            where: {
                studentId,
                classroomId
            }
        });
    }

    async createJoinRequest(studentId: number, classroomId: number): Promise<JoinRequest> {
        return this.prismaService.joinRequest.create({
            data: {
                studentId,
                classroomId,
                status: "pending",
                requestedAt: new Date(),
            }
        });
    }

    async update(data: Partial<JoinRequest>): Promise<JoinRequest> {
        return this.prismaService.joinRequest.update({
            where: {
                id: data.id,
            },
            data,
        });
    }

    async getStudentClassrooms(studentId: number) {
        return this.prismaService.classroom.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                classroomStudents: {
                    where: {
                        studentId,
                        isActive: true,
                        deletedAt: null,
                    },
                },
                joinRequests: {
                    where: {
                        studentId,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

}