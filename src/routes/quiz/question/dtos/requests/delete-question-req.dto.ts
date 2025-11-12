import z from "zod";
import { QuestionSchema } from "../responses/question-res.dto";
import { createZodDto } from "nestjs-zod";

export const DeleteQuestionReqSchema = QuestionSchema.pick({
    id: true,
})

export class DeleteQuestionReqDto extends createZodDto(DeleteQuestionReqSchema) {}

export type DeleteQuestionReqType = z.infer<typeof DeleteQuestionReqSchema>;
