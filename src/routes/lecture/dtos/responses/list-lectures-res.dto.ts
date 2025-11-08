import z from "zod";
import { LectureSchema } from "./lecture-res.dto";
import { BaseListResponse } from "src/shared/models/base-list-response.model";
import { createZodDto } from "nestjs-zod";

export const ListLecturesResSchema = BaseListResponse.extend({
    data: z.array(LectureSchema),
})

export class ListLecturesResDto extends createZodDto(ListLecturesResSchema) {}

export type ListLecturesResType = z.infer<typeof ListLecturesResSchema>;