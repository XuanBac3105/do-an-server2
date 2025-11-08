import { createZodDto } from "nestjs-zod";
import z from "zod";

export const LectureSchema = z.object({
    id: z.number({ message: 'ID phải là một số' }).int('ID phải là một số nguyên').positive('ID phải là một số dương'),
    parentId: z
        .number({ message: 'Parent ID phải là một số' })
        .int('Parent ID phải là một số nguyên')
        .positive('Parent ID phải là một số dương')
        .nullable()
        .optional(),
    title: z.string({ message: 'Tiêu đề không được để trống' }).min(1).max(200),
    content: z.string({ message: 'Nội dung không hợp lệ' }).max(2000).nullable().optional(),
    mediaId: z
        .number({ message: 'Media ID phải là một số' })
        .int('Media ID phải là một số nguyên')
        .positive('Media ID phải là một số dương')
        .nullable()
        .optional(),
    uploadedAt: z.date({ message: 'Ngày tải lên không hợp lệ' }),
    updatedAt: z.date({ message: 'Ngày cập nhật không hợp lệ' }),
    deletedAt: z.date({ message: 'Ngày xóa không hợp lệ' }).nullable().optional(),
})

export class LectureResDto extends createZodDto(LectureSchema) {}