import { createZodDto } from 'nestjs-zod'
import { ChangePasswordSchema, ProfileResSchema, UpdateProfileSchema, UserDecoratorParamSchema } from './profile.model'

export class UserDecoratorParam extends createZodDto(UserDecoratorParamSchema) {}
export class ProfileResDto extends createZodDto(ProfileResSchema) {}

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}