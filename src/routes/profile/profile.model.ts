import { UserSchema } from 'src/shared/models/user.model'
import z from 'zod'

export const UserDecoratorParamSchema = UserSchema.omit({ passwordHash: true })
export const ProfileResSchema = UserDecoratorParamSchema

export const UpdateProfileSchema = UserSchema.pick({
    fullName: true,
    phoneNumber: true,
    avatarMediaId: true,
}).strict()

export const ChangePasswordSchema = z
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