import { BaseListResponse } from "src/shared/models/base-list-response.model";
import { UserSchema } from "src/shared/models/user.model";
import { GetList } from "src/shared/params/get-list.query";
import z from "zod";

export enum UserSortByEnum {
    CREATED_AT = 'createdAt',
    FULL_NAME = 'fullName',
    EMAIL = 'email',
    PHONE_NUMBER = 'phoneNumber',
}

export const GetAllUsersQuery = GetList.extend({
    isActive: z.boolean().optional(),
    sortBy: z.enum(UserSortByEnum).default(UserSortByEnum.CREATED_AT),
});

export const ListUsersResSchema = BaseListResponse.extend({
    data: z.array(UserSchema.omit({ passwordHash: true })),
});

export const GetUserResSchema = UserSchema.omit({ passwordHash: true });