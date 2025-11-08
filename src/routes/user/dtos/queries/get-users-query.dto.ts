import { createZodDto } from 'nestjs-zod'
import { GetList } from 'src/shared/queries/get-list.query'
import z from 'zod'

export enum UserSortByEnum {
    CREATED_AT = 'createdAt',
    FULL_NAME = 'fullName',
    EMAIL = 'email',
    PHONE_NUMBER = 'phoneNumber',
}

export const GetUsersQuery = GetList.extend({
    isActive: z.boolean().optional(),
    sortBy: z.enum(UserSortByEnum).default(UserSortByEnum.CREATED_AT),
})

export class GetUsersQueryDto extends createZodDto(GetUsersQuery) {}

export type GetUsersQueryType = z.infer<typeof GetUsersQuery>
