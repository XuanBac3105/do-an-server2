import z from 'zod'
import { ClassroomSchema } from './classroom-res.model'

export const ListClassroomsResSchema = z.object({
    total: z.number().min(0),
    data: z.array(ClassroomSchema),
})
