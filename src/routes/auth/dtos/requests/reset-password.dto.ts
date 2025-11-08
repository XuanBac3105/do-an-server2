import { createZodDto } from 'nestjs-zod'
import { UserSchema } from 'src/shared/models/user.model'
import z from 'zod'

export const ResetPasswordReqSchema = UserSchema.pick({
    email: true,
})
    .extend({
        otpCode: z.string({ message: 'Mã OTP không hợp lệ' }).length(6, 'Mã OTP phải có 6 ký tự'),
        newPassword: z.string({ message: 'Mật khẩu mới là bắt buộc' }).min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
        confirmNewPassword: z
            .string({ message: 'Mật khẩu xác nhận là bắt buộc' })
            .min(6, 'Mật khẩu xác nhận phải có ít nhất 6 ký tự'),
    })
    .strict()
    .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
        if (newPassword !== confirmNewPassword) {
            ctx.addIssue({
                code: 'custom',
                message: 'Mật khẩu xác nhận không khớp',
                path: ['confirmNewPassword'],
            })
        }
    })

export class ResetPasswordReqDto extends createZodDto(ResetPasswordReqSchema) {}
export type ResetPasswordReqType = z.infer<typeof ResetPasswordReqSchema>
