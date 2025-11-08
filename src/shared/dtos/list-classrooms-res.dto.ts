import { createZodDto } from 'nestjs-zod'
import { ListClassroomsResSchema } from '../models/list-classrooms-res.model'

export class ListClassroomsResDto extends createZodDto(ListClassroomsResSchema) {}
