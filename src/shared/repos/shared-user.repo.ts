import { Role, User } from '@prisma/client'
import { PrismaService } from './../services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class SharedUserRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async findUnique(uniqueObject: { id: number } | { email: string } | { phoneNumber: string }): Promise<User | null> {
        return this.prismaService.user.findUnique({
            where: uniqueObject,
        })
    }

    async getRoleNamesByUserId(userId: number): Promise<Role | null> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
        })
        return user?.role || null
    }

    async updateUser(user: Partial<User>): Promise<User> {
        return this.prismaService.user.update({
            where: { id: user.id },
            data: user,
        })
    }
}
