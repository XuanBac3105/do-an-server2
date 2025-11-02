import { Body, Controller, Get, Put } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ChangePasswordDto, ProfileResDto, UpdateProfileDto, UserDecoratorParam } from './profile.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { CurrentUser } from 'src/shared/decorators/current.decorator'

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get()
    @ZodSerializerDto(ProfileResDto)
    async getProfile(@CurrentUser() user: UserDecoratorParam) {
        return user
    }

    @Put('update')
    @ZodSerializerDto(ProfileResDto)
    async updateProfile(@CurrentUser() user: UserDecoratorParam, @Body() body: UpdateProfileDto) {
        return this.profileService.updateProfile(user.id, body)
    }

    @Put('change-password')
    async changePassword(@CurrentUser() user: UserDecoratorParam, @Body() body: ChangePasswordDto) {
        return this.profileService.changePassword(user.id, body)
    }
}