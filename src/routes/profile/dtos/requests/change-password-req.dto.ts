import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const ChangePasswordReqSchema = z
    .object({
        currentPassword: z.string({ message: 'Mật khẩu không được để trống' }).min(6).max(100),
        newPassword: z.string({ message: 'Mật khẩu mới không được để trống' }).min(6).max(100),
        confirmPassword: z.string({ message: 'Xác nhận mật khẩu không được để trống' }).min(6).max(100),
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    })

export class ChangePasswordReqDto extends createZodDto(ChangePasswordReqSchema) {}

export type ChangePasswordReqType = z.infer<typeof ChangePasswordReqSchema>
