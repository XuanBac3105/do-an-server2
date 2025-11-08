import { createZodDto } from 'nestjs-zod'
import { LoginResSchema } from './login-res.dto'
import z from 'zod'

export const RefreshTokenResSchema = LoginResSchema
export class RefreshTokenResDto extends createZodDto(RefreshTokenResSchema) {}
export type RefreshTokenResType = z.infer<typeof RefreshTokenResSchema>
