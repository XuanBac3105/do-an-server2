import { createZodDto } from "nestjs-zod";
import { LessonLectureResSchema } from "../responses/lesson-lecture-res.dto";
import z from "zod";

export const AssignLectureReqSchema = LessonLectureResSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

export class AssignLectureReqDto extends createZodDto(AssignLectureReqSchema) {}

export type AssignLectureReqType = z.infer<typeof AssignLectureReqSchema>;