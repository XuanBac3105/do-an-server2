import { createZodDto } from 'nestjs-zod'
import {
    RegisterReqSchema,
    RegisterResSchema,
    SendOtpReqSchema,
} from './auth.model'

export class RegisterReqDto extends createZodDto(RegisterReqSchema) {}
export class RegisterResDto extends createZodDto(RegisterResSchema) {}

export class SendOtpReqDto extends createZodDto(SendOtpReqSchema) {}
