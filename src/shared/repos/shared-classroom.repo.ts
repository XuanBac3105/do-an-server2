import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";

@Injectable()
export class SharedClassroomRepo {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async findUnique(uniqueObject: { id: number } | { name: string }) {
        return this.prismaService.classroom.findUnique({
            where: uniqueObject,
        });
    }
}