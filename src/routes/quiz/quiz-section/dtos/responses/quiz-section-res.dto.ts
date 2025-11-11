import { createZodDto } from "nestjs-zod";
import z from "zod";

export const QuizSectionSchema = z.object({
    id: z
        .number({ message: 'ID của phần bài kiểm tra phải là một số.' })
        .int({ message: 'ID của phần bài kiểm tra phải là một số nguyên.' })
        .positive({ message: 'ID của phần bài kiểm tra phải là một số dương.' }),
    title: z
        .string({ message: 'Tiêu đề phần bài kiểm tra là bắt buộc.' })
        .min(1, { message: 'Tiêu đề phần bài kiểm tra không được để trống.' })
        .max(255, { message: 'Tiêu đề phần bài kiểm tra không được vượt quá 255 ký tự.' }),
    quizId: z
        .number({ message: 'ID của bài kiểm tra phải là một số.' })
        .int({ message: 'ID của bài kiểm tra phải là một số nguyên.' })
        .positive({ message: 'ID của bài kiểm tra phải là một số dương.' }),
    description: z
        .string({ message: 'Mô tả phần bài kiểm tra phải là một chuỗi.' })
        .max(1000, { message: 'Mô tả phần bài kiểm tra không được vượt quá 1000 ký tự.' })
        .nullable()
        .optional(),
    orderIndex: z
        .number({ message: 'Chỉ số thứ tự của phần bài kiểm tra phải là một số.' })
        .int({ message: 'Chỉ số thứ tự của phần bài kiểm tra phải là một số nguyên.' })
        .nonnegative({ message: 'Chỉ số thứ tự của phần bài kiểm tra phải là một số dương hoặc bằng 0.' })
        .default(0),
})

export class QuizSectionResDto extends createZodDto(QuizSectionSchema) {}