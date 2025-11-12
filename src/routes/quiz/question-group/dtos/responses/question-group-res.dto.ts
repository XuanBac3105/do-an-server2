import { createZodDto } from "nestjs-zod";
import z from "zod";
import { MediaResSchema } from "src/routes/media/dtos/responses/media-res.dto";

export const QuestionGroupSchema = z.object({
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
    title: z
        .string({ message: "Tiêu đề phải là một chuỗi" })
        .max(255, { message: "Tiêu đề không được vượt quá 255 ký tự" })
        .optional()
        .nullable(),
    introText: z
        .string({ message: "Văn bản giới thiệu phải là một chuỗi" })
        .max(1000, { message: "Văn bản giới thiệu không được vượt quá 1000 ký tự" })
        .optional()
        .nullable(),
    orderIndex: z
        .number({ message: "Chỉ số thứ tự phải là một số" })
        .int({ message: "Chỉ số thứ tự phải là một số nguyên" })
        .nonnegative({ message: "Chỉ số thứ tự phải là một số nguyên không âm" })
        .default(0),
    shuffleInside: z
        .boolean({ message: "Shuffle Inside phải là một giá trị boolean" })
        .default(false),
    createdAt: z
        .date({ message: "Ngày tạo phải là một đối tượng Date hợp lệ" }),
    medias: z
        .array(MediaResSchema)
        .optional(),
});

export class QuestionGroupResDto extends createZodDto(QuestionGroupSchema) {}

export type QuestionGroupResType = z.infer<typeof QuestionGroupSchema>;