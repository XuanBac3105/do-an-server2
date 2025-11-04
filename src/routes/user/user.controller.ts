import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ZodSerializerDto } from 'nestjs-zod';
import { GetAllUsersQueryDto, GetUserResDto, ListUsersResDto } from './user.dto';
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto';
import { ResponseMessage } from 'src/shared/types/response-message.type';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get()
    @ZodSerializerDto(ListUsersResDto)
    async getAllUsers(@Query() query: GetAllUsersQueryDto): Promise<ListUsersResDto> {
        return this.userService.getAllUsers(query);
    }
    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get(':id')
    @ZodSerializerDto(GetUserResDto)
    async getUser(@Param() params: GetIdParamDto): Promise<GetUserResDto> {
        return this.userService.getUser(params.id);
    }
    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('deactivate/:id')
    async deActiveUser(@Param() params: GetIdParamDto): Promise<ResponseMessage> {
        return this.userService.deactiveUser(params.id);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('activate/:id')
    async activateUser(@Param() params: GetIdParamDto): Promise<ResponseMessage> {
        return this.userService.activateUser(params.id);
    }
}
