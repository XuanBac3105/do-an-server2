import z from 'zod'
import { UserSchema } from '../models/user.model'

export type UserResType = z.infer<ReturnType<typeof UserSchema.omit<{ passwordHash: true }>>>
