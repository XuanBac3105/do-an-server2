import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const ExerciseSchema = z.object({
    id: z.number({ message: 'ID không hợp lệ' }).int('Id phải là số nguyên').positive('Id phải là số dương'),
    title: z
        .string({ message: 'Tiêu đề không hợp lệ' })
        .min(2, 'Tiêu đề phải có ít nhất 2 ký tự')
        .max(100, 'Tiêu đề không được vượt quá 100 ký tự'),
    description: z.string({ message: 'Mô tả không hợp lệ' }).max(500).optional().nullable(),
    attachMediaId: z.number({ message: 'ID tệp đính kèm không hợp lệ' }).optional().nullable(),
    createdAt: z.date({ message: 'Ngày tạo không hợp lệ' }).optional(),
    updatedAt: z.date({ message: 'Ngày cập nhật không hợp lệ' }).optional(),
    deletedAt: z.date({ message: 'Ngày xóa không hợp lệ' }).optional().nullable(),
})

export class ExerciseResDto extends createZodDto(ExerciseSchema) {}