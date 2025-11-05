import z from "zod";
import { UserSchema } from "./user.model";

export const ClassroomStudentSchema = z.object({
    classroomId: z.number({ message: "ID lớp học không hợp lệ" }).min(1),
    studentId: z.number({ message: "ID học sinh không hợp lệ" }).min(1),
    joinedAt: z.date({ message: "Ngày tham gia không hợp lệ" }),
    isActive: z.boolean().default(true),
});

export const ClrStdWithStudentSchema = ClassroomStudentSchema.extend({
    student: UserSchema.omit({ passwordHash: true, role: true }),
});