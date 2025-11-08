import { JoinRequest, Prisma } from '@prisma/client'

export interface IJoinreqRepo {
    findById(id: number): Promise<JoinRequest | null>

    findUnique(uniqueObject: { studentId: number; classroomId: number }): Promise<JoinRequest | null>

    createJoinRequest(studentId: number, classroomId: number): Promise<JoinRequest>

    update(data: Partial<JoinRequest>): Promise<JoinRequest>

    countClassrooms(where: Prisma.ClassroomWhereInput): Promise<number>

    findClassrooms(
        where: Prisma.ClassroomWhereInput,
        orderBy: Prisma.ClassroomOrderByWithRelationInput,
        skip: number,
        take: number,
        options?: {
            includeStudentInfo?: boolean
            studentId?: number
        },
    ): Promise<
        Array<
            Prisma.ClassroomGetPayload<{
                include: {
                    classroomStudents: true
                    joinRequests: true
                }
            }>
        >
    >
}
