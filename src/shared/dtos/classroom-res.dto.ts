import { createZodDto } from 'nestjs-zod'
import { ClassroomSchema } from '../models/classroom-res.model'

export class ClassroomResDto extends createZodDto(ClassroomSchema) {}
