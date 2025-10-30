import { UserSchema } from 'src/shared/models/user.model'
import z from 'zod'

export const RegisterReqSchema = UserSchema.pick({
    email: true,
    fullName: true,
    phone: true,
})
    .extend({
        password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
        confirmPassword: z.string().min(6, 'Mật khẩu xác nhận phải có ít nhất 6 ký tự'),
    })
    .strict()
    .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
            ctx.addIssue({
                code: 'custom',
                message: 'Mật khẩu xác nhận không khớp',
                path: ['confirmPassword'],
            })
        }
    })

export const RegisterResSchema = UserSchema.omit({
    passwordHash: true,
})
