import { createZodDto } from "nestjs-zod";
import { ClassroomStudentSchema } from "src/shared/models/classroom-student.model";
import z from "zod";

export const UpdateClrStdSchema = ClassroomStudentSchema.pick({
    classroomId: true,
    studentId: true,
})

export class UpdateClrStdDto extends createZodDto(UpdateClrStdSchema) {}

export type UpdateClrStdType = z.infer<typeof UpdateClrStdSchema>;
