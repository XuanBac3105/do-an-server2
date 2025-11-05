import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";

@Injectable()
export class SharedJreqRepo {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async deleteJreq(classroomId: number, studentId: number): Promise<void> {
        await this.prismaService.joinRequest.deleteMany({
            where: {
                classroomId,
                studentId
            }
        });
    }
}