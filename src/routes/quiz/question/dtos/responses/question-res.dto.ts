import { QuestionType } from "@prisma/client";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { MediaResSchema } from "src/routes/media/dtos/responses/media-res.dto";

export const QuestionSchema = z.object({
    id: z
        .number({ message: "ID phải là một số" })
        .int({ message: "ID phải là một số nguyên" })
        .positive({ message: "ID phải là một số nguyên dương" }),
    quizId: z
        .number({ message: "Quiz ID phải là một số" })
        .int({ message: "Quiz ID phải là một số nguyên" })
        .positive({ message: "Quiz ID phải là một số nguyên dương" }),
    sectionId: z
        .number({ message: "Section ID phải là một số" })
        .int({ message: "Section ID phải là một số nguyên" })
        .positive({ message: "Section ID phải là một số nguyên dương" })
        .optional()
        .nullable(),
    groupId: z
        .number({ message: "Group ID phải là một số" })
        .int({ message: "Group ID phải là một số nguyên" })
        .positive({ message: "Group ID phải là một số nguyên dương" })
        .optional()
        .nullable(),
    content: z
        .string({ message: "Nội dung câu hỏi là bắt buộc" })
        .min(1, { message: "Nội dung câu hỏi không được để trống" })
        .max(1000, { message: "Nội dung câu hỏi không được vượt quá 1000 ký tự" }),
    explanation: z
        .string({ message: "Lời giải thích phải là một chuỗi" })
        .optional()
        .nullable(),
    questionType: z
        .enum(QuestionType, { message: "Loại câu hỏi không hợp lệ" })
        .default(QuestionType.single_choice),
    points: z
        .number({ message: "Điểm phải là một số" })
        .nonnegative({ message: "Điểm phải là một số không âm" })
        .default(1.0),
    orderIndex: z
        .number({ message: "Chỉ số thứ tự phải là một số" })
        .int({ message: "Chỉ số thứ tự phải là một số nguyên" })
        .nonnegative({ message: "Chỉ số thứ tự phải là một số nguyên không âm" })
        .default(0),
    medias: z
        .array(MediaResSchema)
        .optional(),
});

export class QuestionResDto extends createZodDto(QuestionSchema) {}