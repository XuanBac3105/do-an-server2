import { createZodDto } from 'nestjs-zod'
import { UserSchema } from 'src/shared/models/user.model'
import z from 'zod'

export const SendOtpReqSchema = UserSchema.pick({
    email: true,
}).strict()

export class SendOtpReqDto extends createZodDto(SendOtpReqSchema) {}

export type SendOtpReqType = z.infer<typeof SendOtpReqSchema>
