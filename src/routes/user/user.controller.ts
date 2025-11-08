import { Controller, Get, Inject, Param, Put, Query, UseGuards } from '@nestjs/common'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { Role } from '@prisma/client'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { GetUsersQueryDto } from './dtos/queries/get-users-query.dto'
import { ListUsersResDto } from './dtos/responses/list-users-res.dto'
import { UserResDto } from 'src/shared/dtos/user-res.dto'
import type { IUserService } from './services/user.interface.service'

@Controller('user')
export class UserController {
    constructor(@Inject('IUserService') private readonly userService: IUserService) {}

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get()
    @ZodSerializerDto(ListUsersResDto)
    async getAllUsers(@Query() query: GetUsersQueryDto): Promise<ListUsersResDto> {
        return this.userService.getAllUsers(query)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get(':id')
    @ZodSerializerDto(UserResDto)
    async getUser(@Param() params: GetIdParamDto): Promise<UserResDto> {
        return this.userService.getUser(params.id)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('deactivate/:id')
    async deActiveUser(@Param() params: GetIdParamDto): Promise<ResponseMessage> {
        return this.userService.deactiveUser(params.id)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('activate/:id')
    async activateUser(@Param() params: GetIdParamDto): Promise<ResponseMessage> {
        return this.userService.activateUser(params.id)
    }
}
