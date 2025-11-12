import { createZodDto } from "nestjs-zod";
import { ExSubmissionResSchema } from "../responses/ex-submissson-res.dto";
import z from "zod";

export const SubmitExReqSchema = ExSubmissionResSchema.pick({
    lessonId: true,
    exerciseId: true,
    mediaId: true,
});

export class SubmitExReqDto extends createZodDto(SubmitExReqSchema) {}

export type SubmitExReqType = z.infer<typeof SubmitExReqSchema>;