import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { Media } from "@prisma/client";

@Injectable()
export class SharedMediaRepo {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async findById(id: number, includeRelations: boolean = false): Promise<Media | null> {
        return await this.prismaService.media.findUnique({
            where: { id },
            include: includeRelations
                ? {
                    uploader: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                }
                : undefined,
        })
    }

}