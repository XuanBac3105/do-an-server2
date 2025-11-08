import { Prisma, User } from '@prisma/client'

export interface IUserRepo {
    count(where: Prisma.UserWhereInput): Promise<number>

    findMany(
        where: Prisma.UserWhereInput,
        orderBy: Prisma.UserOrderByWithRelationInput,
        skip: number,
        take: number,
    ): Promise<User[]>
}
