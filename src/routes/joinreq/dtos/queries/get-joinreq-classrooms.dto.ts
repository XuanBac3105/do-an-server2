import { createZodDto } from 'nestjs-zod'
import z from 'zod'
import { GetList } from 'src/shared/queries/get-list.query'

export enum JoinreqClassroomSortByEnum {
    CREATED_AT = 'createdAt',
    NAME = 'name',
}

export const GetJoinreqClassroomsQuery = GetList.extend({
    sortBy: z.enum(JoinreqClassroomSortByEnum).default(JoinreqClassroomSortByEnum.CREATED_AT),
})

export class GetJoinreqClassroomsQueryDto extends createZodDto(GetJoinreqClassroomsQuery) {}
export type GetJoinreqClassroomsQueryType = z.infer<typeof GetJoinreqClassroomsQuery>
