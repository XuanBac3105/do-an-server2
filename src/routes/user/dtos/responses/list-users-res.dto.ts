import { createZodDto } from 'nestjs-zod'
import { BaseListResponse } from 'src/shared/models/base-list-response.model'
import { UserSchema } from 'src/shared/models/user.model'
import z from 'zod'

export const ListUsersResSchema = BaseListResponse.extend({
    data: z.array(UserSchema.omit({ passwordHash: true })),
})

export class ListUsersResDto extends createZodDto(ListUsersResSchema) {}

export type ListUsersResType = z.infer<typeof ListUsersResSchema>
