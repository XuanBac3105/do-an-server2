import { createZodDto } from "nestjs-zod";
import { CreateLectureSchema, LectureResSchema, LectureTreeResponseSchema, LectureListResponseSchema, LectureSchema, UpdateLectureSchema, GetListLecturesQuery } from "./lecture.model";

export class GetListLecturesQueryDto extends createZodDto(GetListLecturesQuery) {}
export class LectureResDto extends createZodDto(LectureResSchema) {}
export class CreateLectureDto extends createZodDto(CreateLectureSchema) {}
export class UpdateLectureDto extends createZodDto(UpdateLectureSchema) {}
export class LectureTreeResponseDto extends createZodDto(LectureTreeResponseSchema) {}
export class LectureListResponseDto extends createZodDto(LectureListResponseSchema) {}