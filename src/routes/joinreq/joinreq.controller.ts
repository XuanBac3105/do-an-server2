import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JoinreqService } from './joinreq.service';
import { Role } from '@prisma/client';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { CreateJoinreqReqDto, JoinreqResDto, LeaveClrDto } from './joinreq.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from 'src/shared/decorators/current-use.decorator';
import { GetUserParamDto } from 'src/shared/dtos/get-user-param.dto';
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto';
import { ResponseMessage } from 'src/shared/types/response-message.type';

@Controller('join-request')
export class JoinreqController {
    constructor(
        private readonly joinreqService: JoinreqService
    ) {}

    @UseGuards(RoleGuard)
    @Roles(Role.student)
    @Get('classrooms')
    async getClassrooms(@CurrentUser() user: GetUserParamDto) {
        return this.joinreqService.studentViewClassrooms(user.id);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.student)
    @Get('joined-classrooms')
    async getJoinedClassrooms(@CurrentUser() user: GetUserParamDto) {
        return this.joinreqService.studentViewJoinedClassrooms(user.id);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.student)
    @Post()
    @ZodSerializerDto(JoinreqResDto)
    async createJoinRequest(@Body() body: CreateJoinreqReqDto, @CurrentUser() user: GetUserParamDto): Promise<JoinreqResDto> {
        return this.joinreqService.createJoinRequest(user.id, body);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.student)
    @Delete('leave-classroom')
    async leaveClassroom(@CurrentUser() user: GetUserParamDto, @Body() body: LeaveClrDto): Promise<ResponseMessage> {
        return this.joinreqService.leaveClassroom(user.id, body.classroomId);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('/:id/approve')
    async approveJoinRequest(@Param() params: GetIdParamDto): Promise<JoinreqResDto> {
        return this.joinreqService.approveJoinRequest(params.id);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('/:id/reject')
    async rejectJoinRequest(@Param() params: GetIdParamDto): Promise<JoinreqResDto> {
        return this.joinreqService.rejectJoinRequest(params.id);
    }
}