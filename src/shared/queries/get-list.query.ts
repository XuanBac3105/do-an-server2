import z from "zod";
import { EnumOrder } from "../constants/enum-order.constant";

export const GetList = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    order: z.enum(EnumOrder).default(EnumOrder.ASC),
    search: z.string().optional(),
})