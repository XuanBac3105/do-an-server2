import { ClrStdWithStudentSchema } from 'src/shared/models/classroom-student.model';
import { JoinreqWithStudentSchema } from 'src/shared/models/join-request.model';
import { GetList } from 'src/shared/params/get-list.query';
import { z } from 'zod';

export const ClassroomSchema = z.object({
    id: z.number().min(1),
    name: z.string({ message: "Tên lớp học là bắt buộc" }).min(1).max(200),
    isArchived: z.boolean().optional(),
    description: z.string().max(2000).optional().nullable(),
    createdAt: z.date({ message: "Ngày tạo không hợp lệ" }),
    updatedAt: z.date({ message: "Ngày cập nhật không hợp lệ" }),
    deletedAt: z.date().nullable().optional(),
});

export const ClassroomWithStdJreqSchema = ClassroomSchema.extend({
    joinRequests: z.array(JoinreqWithStudentSchema),
    classroomStudents: z.array(ClrStdWithStudentSchema),
});

export enum ClassroomSortByEnum {
    CREATED_AT = 'createdAt',
    NAME = 'name',
};

export const GetListClassroomsQuery = GetList.extend({
    isArchived: z.boolean().optional(),
    sortBy: z.enum(ClassroomSortByEnum).default(ClassroomSortByEnum.CREATED_AT),
});


export const ListClassroomsResSchema = z.object({
    total: z.number().min(0),
    data: z.array(ClassroomSchema),
});

export const ClassroomResSchema = ClassroomSchema;

export const CreateClassroomReqSchema = ClassroomSchema.pick({
    name: true,
    description: true,
});

export const UpdateClassroomReqSchema = ClassroomSchema.pick({
    name: true,
    isArchived: true,
    description: true,
});