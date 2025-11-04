import { createZodDto } from "nestjs-zod";
import { GetAllUsersQuery, GetUserResSchema, ListUsersResSchema } from "./user.model";

export class GetAllUsersQueryDto extends createZodDto(GetAllUsersQuery) {}
export class ListUsersResDto extends createZodDto(ListUsersResSchema) {}
export class GetUserResDto extends createZodDto(GetUserResSchema) {}