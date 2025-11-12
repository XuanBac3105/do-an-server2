import z from "zod";

export const LectureTreeNodeSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z
            .number({ message: "ID phải là một số" })
            .int({ message: "ID phải là một số nguyên" })
            .positive({ message: "ID phải là một số dương" }),
        parentId: z
            .number({ message: "Parent ID phải là một số" })
            .int({ message: "Parent ID phải là một số nguyên" })
            .positive({ message: "Parent ID phải là một số dương" })
            .nullable()
            .optional(),
        title: z.string({ message: "Tiêu đề là bắt buộc" }),
        content: z
            .string({ message: "Nội dung phải là chuỗi" })
            .nullable()
            .optional(),
        mediaId: z
            .number({ message: "Media ID phải là một số" })
            .int({ message: "Media ID phải là một số nguyên" })
            .positive({ message: "Media ID phải là một số dương" })
            .nullable()
            .optional(),
        uploadedAt: z.date({ message: "Ngày tải lên phải là một ngày hợp lệ" }),
        updatedAt: z.date({ message: "Ngày cập nhật phải là một ngày hợp lệ" }),
        children: z.array(LectureTreeNodeSchema).optional(),
    })
);

export type LectureTreeNodeType = {
    id: number;
    parentId?: number | null;
    title: string;
    content?: string | null;
    mediaId?: number | null;
    uploadedAt: Date;
    updatedAt: Date;
    children?: LectureTreeNodeType[];
};
