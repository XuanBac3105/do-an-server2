import { JoinRequestStatus } from "@prisma/client";
import z from "zod";
import { UserSchema } from "./user.model";

export const JoinreqSchema = z.object({
    id: z.number({ message: "ID phải là một số"}).int("ID phải là một số nguyên").positive("ID phải là một số dương"),
    studentId: z.number({ message: "Student ID phải là một số"}).int("Student ID phải là một số nguyên").positive("Student ID phải là một số dương"),
    classroomId: z.number({ message: "Classroom ID phải là một số"}).int("Classroom ID phải là một số nguyên").positive("Classroom ID phải là một số dương"),
    status: z.enum(JoinRequestStatus, { message: "Trạng thái không hợp lệ"}),
    requestedAt: z.date({ message: "Ngày gửi yêu cầu phải là một ngày hợp lệ"}),
    handledAt: z.date({ message: "Ngày xử lý phải là một ngày hợp lệ"}).nullable(),
});

export const JoinreqWithStudentSchema = JoinreqSchema.extend({
    student: UserSchema.omit({ passwordHash: true, role: true })
});