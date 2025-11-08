import { Body, Controller, Get, Inject, Put } from '@nestjs/common'
import { CurrentUser } from 'src/shared/decorators/current-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { GetUserParamDto } from 'src/shared/dtos/get-user-param.dto'
import { UserResDto } from 'src/shared/dtos/user-res.dto'
import { UpdateProfileReqDto } from './dtos/requests/update-profile-req.dto'
import { ChangePasswordReqDto } from './dtos/requests/change-password-req.dto'
import type { IProfileService } from './services/profile.interface.service'

@Controller('profile')
export class ProfileController {
    constructor(@Inject('IProfileService') private readonly profileService: IProfileService) {}

    @Get()
    @ZodSerializerDto(UserResDto)
    async getProfile(@CurrentUser() user: GetUserParamDto): Promise<UserResDto> {
        return user
    }

    @Put('update')
    @ZodSerializerDto(UserResDto)
    async updateProfile(@CurrentUser() user: GetUserParamDto, @Body() body: UpdateProfileReqDto): Promise<UserResDto> {
        return this.profileService.updateProfile(user.id, body)
    }

    @Put('change-password')
    async changePassword(
        @CurrentUser() user: GetUserParamDto,
        @Body() body: ChangePasswordReqDto,
    ): Promise<ResponseMessage> {
        return this.profileService.changePassword(user.id, body)
    }
}
