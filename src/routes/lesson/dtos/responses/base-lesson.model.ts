import z from "zod";

export const BaseLessonSchema = z.object({
    id: z
        .number({ message: "ID phải là một số" })
        .int({ message: "ID phải là một số nguyên" })
        .positive({ message: "ID phải là một số dương" }),
    classroomId: z
        .number({ message: "Classroom ID phải là một số" })
        .int({ message: "Classroom ID phải là một số nguyên" })
        .positive({ message: "Classroom ID phải là một số dương" }),
    orderIndex: z
        .number({ message: "Chỉ số thứ tự phải là một số" })
        .int({ message: "Chỉ số thứ tự phải là một số nguyên" })
        .nonnegative({ message: "Chỉ số thứ tự phải là một số không âm" })
        .default(0),
    createdAt: z
        .date({ message: "Ngày tạo phải là một ngày hợp lệ" }),
    updatedAt: z
        .date({ message: "Ngày cập nhật phải là một ngày hợp lệ" }),
    deletedAt: z
        .date({ message: "Ngày xóa phải là một ngày hợp lệ" })
        .nullable()
        .optional(),
});
