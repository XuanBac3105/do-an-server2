import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/services/prisma.service";

@Injectable()
export class UserRepo {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}

}