import z from "zod";

export const BaseListResponse = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
})