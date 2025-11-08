import { createZodDto } from 'nestjs-zod'
import { UserSchema } from 'src/shared/models/user.model'
import z from 'zod'

export const LoginReqSchema = UserSchema.pick({
    email: true,
})
    .extend({
        password: z.string({ message: 'Mật khẩu là bắt buộc' }).min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    })
    .strict()

export class LoginReqDto extends createZodDto(LoginReqSchema) {}

export type LoginReqType = z.infer<typeof LoginReqSchema>
