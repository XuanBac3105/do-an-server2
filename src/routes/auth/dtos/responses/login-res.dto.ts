import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const LoginResSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
})

export class LoginResDto extends createZodDto(LoginResSchema) {}

export type LoginResType = z.infer<typeof LoginResSchema>
