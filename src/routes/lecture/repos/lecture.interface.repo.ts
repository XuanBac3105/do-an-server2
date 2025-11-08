import { Prisma, Lecture } from '@prisma/client'

export interface ILectureRepo {
    count(where: Prisma.LectureWhereInput): Promise<number>

    findMany(
        where: Prisma.LectureWhereInput,
        orderBy: Prisma.LectureOrderByWithRelationInput,
        skip: number,
        take: number,
    ): Promise<Lecture[]>

    findById(id: number): Promise<Lecture | null>

    create(data: {
        parentId?: number | null
        title: string
        content: string | null
        mediaId: number | null
    }): Promise<Lecture>

    update(
        id: number,
        data: {
            parentId?: number | null
            title?: string
            content?: string | null
            mediaId?: number | null
        },
    ): Promise<Lecture>

    softDelete(id: number): Promise<Lecture>
}
