import { createZodDto } from 'nestjs-zod'
import { UserSchema } from 'src/shared/models/user.model'
import z from 'zod'

export const UpdateProfileReqSchema = UserSchema.pick({
    fullName: true,
    phoneNumber: true,
    avatarMediaId: true,
}).strict()

export class UpdateProfileReqDto extends createZodDto(UpdateProfileReqSchema) {}

export type UpdateProfileReqType = z.infer<typeof UpdateProfileReqSchema>
