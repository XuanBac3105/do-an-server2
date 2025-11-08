import { createZodDto } from 'nestjs-zod'
import { UserSchema } from 'src/shared/models/user.model'
import z from 'zod'

export const RegisterReqSchema = UserSchema.pick({
    email: true,
    fullName: true,
    phoneNumber: true,
})
    .extend({
        otpCode: z.string({ message: 'Mã OTP không hợp lệ' }).length(6, 'Mã OTP phải có 6 ký tự'),
        password: z.string({ message: 'Mật khẩu là bắt buộc' }).min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
        confirmPassword: z
            .string({ message: 'Mật khẩu xác nhận là bắt buộc' })
            .min(6, 'Mật khẩu xác nhận phải có ít nhất 6 ký tự'),
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

export class RegisterReqDto extends createZodDto(RegisterReqSchema) {}

export type RegisterReqType = z.infer<typeof RegisterReqSchema>
