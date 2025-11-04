import z from "zod";

export const GetIdParam = z.object({
    id: z.coerce.number({ message: "ID không hợp lệ" }).min(1),
});