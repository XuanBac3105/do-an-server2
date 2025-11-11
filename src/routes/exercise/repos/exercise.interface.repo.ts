import { Exercise, Prisma } from '@prisma/client'

export interface IExerciseRepo {
    create(data: { title: string; description?: string; attachMediaId?: number }): Promise<Exercise>
    count(where: Prisma.ExerciseWhereInput): Promise<number>

    findMany(
        where: Prisma.ExerciseWhereInput,
        orderBy: Prisma.ExerciseOrderByWithRelationInput,
        skip: number,
        take: number,
    ): Promise<Exercise[]>

    findById(id: number): Promise<Exercise | null>

    update(id: number, data: Partial<Exercise>): Promise<Exercise>
}