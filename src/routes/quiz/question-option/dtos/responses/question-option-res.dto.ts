import { createZodDto } from "nestjs-zod";
import z from "zod";
import { MediaResSchema } from "src/routes/media/dtos/responses/media-res.dto";

export const QuestionOptionSchema = z.object({
    id: z
        .number({ message: "ID phải là một số" })
        .int({ message: "ID phải là một số nguyên" })
        .positive({ message: "ID phải là một số nguyên dương" }),
    questionId: z
        .number({ message: "Question ID phải là một số" })
        .int({ message: "Question ID phải là một số nguyên" })
        .positive({ message: "Question ID phải là một số nguyên dương" }),
    content: z
        .string({ message: "Nội dung lựa chọn là bắt buộc" })
        .min(1, { message: "Nội dung lựa chọn không được để trống" })
        .max(500, { message: "Nội dung lựa chọn không được vượt quá 500 ký tự" }),
    isCorrect: z
        .boolean({ message: "isCorrect phải là boolean" })
        .default(false),
    orderIndex: z
        .number({ message: "Chỉ số thứ tự phải là một số" })
        .int({ message: "Chỉ số thứ tự phải là một số nguyên" })
        .nonnegative({ message: "Chỉ số thứ tự phải là một số nguyên không âm" })
        .default(0),
    medias: z
        .array(MediaResSchema)
        .optional(),
});

export class QuestionOptionResDto extends createZodDto(QuestionOptionSchema) {}
