import { JoinreqSchema } from "src/shared/models/join-request.model";
import z from "zod";

export const CreateJoinreqReqSchema = z.object({
    classroomId: z.number({ message: "Classroom ID phải là một số"}).int("Classroom ID phải là một số nguyên").positive("Classroom ID phải là một số dương"),
});

export const JoinreqResSchema = JoinreqSchema;

export const ListJoinreqResSchema = z.object({
    joinRequests: z.array(JoinreqResSchema),
    total: z.number({ message: "Tổng số phải là một số"}).int("Tổng số phải là một số nguyên").nonnegative("Tổng số phải là một số không âm"),
});


export const LeaveClrSchema = CreateJoinreqReqSchema