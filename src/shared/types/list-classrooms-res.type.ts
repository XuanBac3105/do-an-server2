import z from 'zod'
import { ListClassroomsResSchema } from '../models/list-classrooms-res.model'

export type ListClassroomsResType = z.infer<typeof ListClassroomsResSchema>
