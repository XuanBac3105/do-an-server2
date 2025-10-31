import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { Role } from '@prisma/client'

@Injectable()
export class SharedUserRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async findUnique(uniqueObject: { id: number } | { email: string }) {
        return this.prismaService.user.findUnique({
            where: uniqueObject,
        })
    }

    async createUser(data: {
        fullName: string
        email: string
        passwordHash: string
        role: Role
        phone: string
    }) {
        return this.prismaService.user.create({
            data,
        })
    }

    async update(uniqueObject: { id: number } | { email: string }, data: { name?: string; passwordHash?: string }) {
        return this.prismaService.user.update({
            where: uniqueObject,
            data,
        })
    }
}
