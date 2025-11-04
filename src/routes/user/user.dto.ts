import { createZodDto } from "nestjs-zod";
import { GetAllUsersQuery, ListUsersResSchema } from "./user.model";

export class GetAllUsersQueryDto extends createZodDto(GetAllUsersQuery) {}
export class ListUsersResDto extends createZodDto(ListUsersResSchema) {}