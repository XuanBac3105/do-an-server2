import { createZodDto } from "nestjs-zod";
import z from "zod";

export const GetLessonsByClassroomQuerySchema = z.object({
    classroomId: z
        .string({ message: "Classroom ID là bắt buộc" })
        .regex(/^\d+$/, { message: "Classroom ID phải là một số" })
        .transform((val) => parseInt(val, 10)),
});

export class GetLessonsByClassroomQueryDto extends createZodDto(GetLessonsByClassroomQuerySchema) {}

export type GetLessonsByClassroomQueryType = z.infer<typeof GetLessonsByClassroomQuerySchema>;
