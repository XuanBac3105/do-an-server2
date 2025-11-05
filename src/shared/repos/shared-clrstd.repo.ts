import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";

@Injectable()
export class SharedClrStdRepo {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async create(data: { classroomId: number; studentId: number; }) {
        return this.prismaService.classroomStudent.create({
            data,
        });
    }

    async update(data: { classroomId: number; studentId: number; isActive?: boolean; deletedAt?: Date }): Promise<void> {
        await this.prismaService.classroomStudent.update({
            where: {
                classroomId_studentId: {
                    classroomId: data.classroomId,
                    studentId: data.studentId,
                },
            },
            data,
        });
    }
}