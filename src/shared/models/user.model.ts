import { Role } from '@prisma/client'
import z from 'zod'

export const UserSchema = z.object({
    id: z
        .number('ID người dùng phải là một số nguyên')
        .int('ID người dùng phải là một số nguyên')
        .positive('ID người dùng phải là một số nguyên dương'),
    email: z.email('Email không hợp lệ'),
    fullName: z
        .string()
        .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
        .max(100, 'Họ và tên không được vượt quá 100 ký tự'),
    passwordHash: z.string(),
    phoneNumber: z
        .string()
        .min(10, 'Số điện thoại phải có ít nhất 10 chữ số')
        .max(15, 'Số điện thoại không được vượt quá 15 chữ số'),
    role: z.enum(Role, 'Vai trò không hợp lệ'),
    avatarMediaId: z.number().int().positive().nullable(),
    isActive: z.boolean().default(true),
    createdAt: z.date(),
    updatedAt: z.date(),
})
