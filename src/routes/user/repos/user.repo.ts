import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import { IUserRepo } from './user.interface.repo'

@Injectable()
export class UserRepo implements IUserRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async count(where: Prisma.UserWhereInput): Promise<number> {
        return this.prismaService.user.count({ where })
    }

    async findMany(
        where: Prisma.UserWhereInput,
        orderBy: Prisma.UserOrderByWithRelationInput,
        skip: number,
        take: number,
    ): Promise<User[]> {
        return this.prismaService.user.findMany({
            where,
            orderBy,
            skip,
            take,
        })
    }
}
