import { Injectable } from '@nestjs/common'
import { IExerciseRepo } from './exercise.interface.repo'
import { Exercise, Prisma } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class ExerciseRepo implements IExerciseRepo {
    constructor(private readonly prismaService: PrismaService) {}
    async create(data: { title: string; description?: string; attachMediaId?: number }): Promise<Exercise> {
        return this.prismaService.exercise.create({
            data: {
                title: data.title,
                description: data.description,
                attachMediaId: data.attachMediaId,
            },
        })
    }

    async count(where: Prisma.ExerciseWhereInput): Promise<number> {
        return this.prismaService.exercise.count({ where })
    }

    async findMany(
        where: Prisma.ExerciseWhereInput,
        orderBy: Prisma.ExerciseOrderByWithRelationInput,
        skip: number,
        take: number,
    ): Promise<Exercise[]> {
        return this.prismaService.exercise.findMany({
            where,
            orderBy,
            skip,
            take,
        })
    }

    async findById(id: number): Promise<Exercise | null> {
        return this.prismaService.exercise.findUnique({
            where: { id },
        })
    }

    async update(id: number, data: Partial<Exercise>): Promise<Exercise> {
        return this.prismaService.exercise.update({
            where: { id },
            data,
        })
    }
}
