import { createZodDto } from 'nestjs-zod'
import { RegisterReqSchema, RegisterResSchema } from './auth.model'

export class RegisterReqDto extends createZodDto(RegisterReqSchema) {}
export class RegisterResDto extends createZodDto(RegisterResSchema) {}
