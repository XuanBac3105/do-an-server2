import { Classroom, Prisma } from '@prisma/client'
import { ClrWithStdJreqType } from '../dtos/responses/clr-with-std-and-jreq.dto'

export interface IClassroomRepo {
    count(where: Prisma.ClassroomWhereInput): Promise<number>

    findMany(
        where: Prisma.ClassroomWhereInput,
        orderBy: Prisma.ClassroomOrderByWithRelationInput,
        skip: number,
        take: number,
    ): Promise<Classroom[]>

    findClassroomWithStdJreq(id: number): Promise<ClrWithStdJreqType | null>

    create(data: { name: string; description?: string | null }): Promise<Classroom>

    update(data: Partial<Classroom>): Promise<Classroom>
}
