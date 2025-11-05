import { ClassroomStudentSchema } from "src/shared/models/classroom-student.model";

export const UpdateClrStdSchema = ClassroomStudentSchema.pick({
    classroomId: true,
    studentId: true,
});