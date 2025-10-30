import z from "zod"
import { RegisterReqSchema } from './auth.model';
import { UserSchema } from "src/shared/models/user.model";

export type AuthType = z.infer<typeof UserSchema>
export type RegisterReqType = z.infer<typeof RegisterReqSchema>