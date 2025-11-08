import { createZodDto } from 'nestjs-zod'
import z from 'zod'
import { BaseListResponse } from 'src/shared/models/base-list-response.model'

export const JoinreqClassroomSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    coverMediaId: z.number().nullable(),
    isArchived: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    isJoined: z.boolean(),
    joinRequest: z
        .object({
            id: z.number(),
            status: z.string(),
            requestedAt: z.date(),
            handledAt: z.date().nullable(),
        })
        .nullable(),
})

export const JoinreqClassroomListRes = BaseListResponse.extend({
    data: z.array(JoinreqClassroomSchema),
})

export class JoinreqClassroomListResDto extends createZodDto(JoinreqClassroomListRes) {}
export type JoinreqClassroomListResType = z.infer<typeof JoinreqClassroomListRes>

export const JoinedClassroomSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    coverMediaId: z.number().nullable(),
    isArchived: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export const JoinedClassroomListRes = BaseListResponse.extend({
    data: z.array(JoinedClassroomSchema),
})

export class JoinedClassroomListResDto extends createZodDto(JoinedClassroomListRes) {}
export type JoinedClassroomListResType = z.infer<typeof JoinedClassroomListRes>
