import { createZodDto } from 'nestjs-zod'
import z from 'zod'
import { GetList } from 'src/shared/queries/get-list.query'

export enum ClassroomSortByEnum {
    CREATED_AT = 'createdAt',
    NAME = 'name',
}

export const GetListClassroomsQuery = GetList.extend({
    isArchived: z.boolean().optional(),
    sortBy: z.enum(ClassroomSortByEnum).default(ClassroomSortByEnum.CREATED_AT),
})

export class GetClassroomsQueryDto extends createZodDto(GetListClassroomsQuery) {}
export type GetClassroomsQueryType = z.infer<typeof GetListClassroomsQuery>
