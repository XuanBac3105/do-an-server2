import { createZodDto } from "nestjs-zod";
import { UserSchema } from "../models/user.model";

export class GetUserParamDto extends createZodDto(UserSchema.omit({ passwordHash: true })) {}