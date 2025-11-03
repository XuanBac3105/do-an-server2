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

export const RegisterResSchema = UserSchema.omit({
    passwordHash: true,
})

export const SendOtpReqSchema = UserSchema.pick({
    email: true,
}).strict()

export const ForgotPasswordReqSchema = SendOtpReqSchema

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

export const LoginReqSchema = UserSchema.pick({
    email: true,
})
    .extend({
        password: z.string({ message: 'Mật khẩu là bắt buộc' }).min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    })
    .strict()

export const LoginResSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
})

export const RefreshTokenReqSchema = z.object({
    refreshToken: z.string({ message: 'Refresh token là bắt buộc' }),
})

export const RefreshTokenResSchema = LoginResSchema

export const LogoutReqSchema = RefreshTokenReqSchema