import { createZodDto } from "nestjs-zod";
import z from "zod";

export const GradeSubmissionReqSchema = z.object({
    score: z
        .number({ message: "Điểm số là bắt buộc" })
        .min(0, "Điểm số không được nhỏ hơn 0")
        .max(100, "Điểm số không được lớn hơn 100"),
    comment: z
        .string({ message: "Nhận xét phải là chuỗi ký tự" })
        .max(1000, "Nhận xét không được vượt quá 1000 ký tự")
        .optional()
        .nullable(),
});

export class GradeSubmissionReqDto extends createZodDto(GradeSubmissionReqSchema) {}

export type GradeSubmissionReqType = z.infer<typeof GradeSubmissionReqSchema>;
