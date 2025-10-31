import { Injectable } from '@nestjs/common'
import { User } from '../../prisma/generated/prisma-client'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class AuthRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async createUser(data: {
        fullName: string
        email: string
        passwordHash: string
        role: 'student' | 'admin'
        phone?: string
    }): Promise<User> {
        const user = await this.prismaService.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                passwordHash: data.passwordHash,
                role: data.role,
                phone: data.phone || '',
            },
        })
        return user
    }
}
