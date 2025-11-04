import { createZodDto } from "nestjs-zod";
import {
    ClassroomResSchema,
    ListClassroomsResSchema,
    UpdateClassroomReqSchema,
    CreateClassroomReqSchema,
    GetListClassroomsQuery,
    ClassroomWithStdJreqSchema,
} from "./classroom.model";

export class GetListClassroomsQueryDto extends createZodDto(GetListClassroomsQuery) {}
export class ListClassroomsResDto extends createZodDto(ListClassroomsResSchema) {}

export class ClassroomWithStdJreqDto extends createZodDto(ClassroomWithStdJreqSchema) {}

export class ClassroomResDto extends createZodDto(ClassroomResSchema) {}

export class CreateClassroomReqDto extends createZodDto(CreateClassroomReqSchema) {}

export class UpdateClassroomReqDto extends createZodDto(UpdateClassroomReqSchema) {}