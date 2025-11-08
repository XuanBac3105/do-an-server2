import { createZodDto } from "nestjs-zod";
import { LectureSchema } from "../responses/lecture-res.dto";
import z from "zod";

export const CreateLectureReqSchema = LectureSchema.pick({
    parentId: true,
    title: true,
    content: true,
    mediaId: true,
})

export class CreateLectureReqDto extends createZodDto(CreateLectureReqSchema) {}

export type CreateLectureReqType = z.infer<typeof CreateLectureReqSchema>;