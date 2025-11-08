import { createZodDto } from "nestjs-zod";
import { CreateLectureReqSchema } from "./create-lecture-req.dto";
import z from "zod";

export const UpdateLectureSchema = CreateLectureReqSchema.partial();
export class UpdateLectureReqDto extends createZodDto(UpdateLectureSchema) {}
export type UpdateLectureReqType = z.infer<typeof UpdateLectureSchema>;