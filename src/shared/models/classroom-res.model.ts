import z from 'zod'

export const ClassroomSchema = z.object({
    id: z.number().min(1),
    name: z.string({ message: 'Tên lớp học là bắt buộc' }).min(1).max(200),
    isArchived: z.boolean().optional(),
    description: z.string().max(2000).optional().nullable(),
    createdAt: z.date({ message: 'Ngày tạo không hợp lệ' }),
    updatedAt: z.date({ message: 'Ngày cập nhật không hợp lệ' }),
    deletedAt: z.date().nullable().optional(),
})
