import { GradingMethod } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const QuizSchema = z.object({
    id: z
        .number({ message: 'ID phải là một số.' })
        .int({ message: 'ID phải là một số nguyên.' })
        .positive({ message: 'ID phải là một số nguyên dương.' }),
    title: z
        .string({ message: 'Tiêu đề phải là một chuỗi.' })
        .max(200, { message: 'Tiêu đề không được vượt quá 200 ký tự.' }),
    description: z
        .string({ message: 'Mô tả phải là một chuỗi.' })
        .max(1000, { message: 'Mô tả không được vượt quá 1000 ký tự.' })
        .nullable()
        .optional(),
    timeLimitSec: z
        .number({ message: 'Giới hạn thời gian phải là một số.' })
        .int({ message: 'Giới hạn thời gian phải là một số nguyên.' }),
    maxAttempts: z
        .number({ message: 'Số lần làm bài tối đa phải là một số.' })
        .int({ message: 'Số lần làm bài tối đa phải là một số nguyên.' })
        .default(1),
    shuffleQuestions: z.boolean({ message: 'Trộn câu hỏi phải là một giá trị boolean.' }).default(true),
    shuffleOptions: z.boolean({ message: 'Trộn lựa chọn phải là một giá trị boolean.' }).default(true),
    gradingMethod: z.enum(GradingMethod).default(GradingMethod.first),
    createdAt: z.date({ message: 'Ngày tạo không hợp lệ.' }),
    updatedAt: z.date({ message: 'Ngày cập nhật không hợp lệ.' }),
    deletedAt: z.date({ message: 'Ngày xóa không hợp lệ.' }).nullable().optional(),
})

export class QuizResDto extends createZodDto(QuizSchema) {}
