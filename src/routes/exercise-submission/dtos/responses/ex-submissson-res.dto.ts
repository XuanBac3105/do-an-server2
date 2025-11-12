import { createZodDto } from "nestjs-zod"
import { MediaResSchema } from "src/routes/media/dtos/responses/media-res.dto"
import { UserSchema } from "src/shared/models/user.model"
import z from "zod"

export const ExerciseSubmissionSchema = z.object({
    id: z
        .number({ message: "ID là bắt buộc" })
        .int("ID phải là số nguyên")
        .positive("ID phải là số dương"),
    lessonId: z
        .number({ message: "ID bài học là bắt buộc" })
        .int("ID bài học phải là số nguyên")
        .positive("ID bài học phải là số dương"),
    exerciseId: z
        .number({ message: "ID bài tập là bắt buộc" })
        .int("ID bài tập phải là số nguyên")
        .positive("ID bài tập phải là số dương"),
    studentId: z
        .number({ message: "ID học viên là bắt buộc" })
        .int("ID học viên phải là số nguyên")
        .positive("ID học viên phải là số dương"),
    mediaId: z
        .number({ message: "ID media là bắt buộc" })
        .int("ID media phải là số nguyên")
        .positive("ID media phải là số dương"),
    submittedAt: z
        .date("Thời gian nộp bài không hợp lệ")
        .default(new Date()),
    score: z
        .number({ message: "Điểm số là bắt buộc" })
        .min(0, "Điểm số không được nhỏ hơn 0")
        .max(100, "Điểm số không được lớn hơn 100")
        .nullable()
        .optional(),
    comment: z
        .string({ message: "Bình luận phải là chuỗi ký tự" })
        .max(500, "Bình luận không được vượt quá 500 ký tự")
        .nullable()
        .optional(),
    gradedAt: z
        .date("Thời gian chấm điểm không hợp lệ")
        .nullable()
        .optional(),
})

export const ExSubmissionResSchema = ExerciseSubmissionSchema.extend({
    media: MediaResSchema,
    student: UserSchema.omit({ passwordHash: true }).optional(),
})

export class ExSubmissionResDto extends createZodDto(ExSubmissionResSchema) {}

export type ExSubmissionResType = z.infer<typeof ExSubmissionResSchema>