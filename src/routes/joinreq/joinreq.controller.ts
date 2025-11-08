import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { ZodSerializerDto } from 'nestjs-zod'
import { CurrentUser } from 'src/shared/decorators/current-user.decorator'
import { GetUserParamDto } from 'src/shared/dtos/get-user-param.dto'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { GetJoinreqClassroomsQueryDto } from './dtos/queries/get-joinreq-classrooms.dto'
import { JoinreqClassroomListResDto, JoinedClassroomListResDto } from './dtos/responses/joinreq-classroom-list-res.dto'
import { CreateJoinreqReqDto } from './dtos/requests/create-joinreq.dto'
import { JoinreqResDto } from './dtos/responses/joinreq-res.dto'
import { LeaveClrDto } from './dtos/requests/leave-classroom.dto'
import type { IJoinreqService } from './services/joinreq.interface.service'

@Controller('join-request')
export class JoinreqController {
    constructor(
        @Inject('IJoinreqService')
        private readonly joinreqService: IJoinreqService
    ) {}

    @UseGuards(RoleGuard)
    @Roles(Role.student)
    @Get('classrooms')
    @ZodSerializerDto(JoinreqClassroomListResDto)
    async getClassrooms(
        @CurrentUser() user: GetUserParamDto,
        @Query() query: GetJoinreqClassroomsQueryDto,
    ): Promise<JoinreqClassroomListResDto> {
        return this.joinreqService.studentViewClassrooms(user.id, query)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.student)
    @Get('joined-classrooms')
    @ZodSerializerDto(JoinedClassroomListResDto)
    async getJoinedClassrooms(
        @CurrentUser() user: GetUserParamDto,
        @Query() query: GetJoinreqClassroomsQueryDto,
    ): Promise<JoinedClassroomListResDto> {
        return this.joinreqService.studentViewJoinedClassrooms(user.id, query)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.student)
    @Post()
    @ZodSerializerDto(JoinreqResDto)
    async createJoinRequest(
        @Body() body: CreateJoinreqReqDto,
        @CurrentUser() user: GetUserParamDto,
    ): Promise<JoinreqResDto> {
        return this.joinreqService.createJoinRequest(user.id, body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.student)
    @Delete('leave-classroom')
    async leaveClassroom(@CurrentUser() user: GetUserParamDto, @Body() body: LeaveClrDto): Promise<ResponseMessage> {
        return this.joinreqService.leaveClassroom(user.id, body.classroomId)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('/:id/approve')
    async approveJoinRequest(@Param() params: GetIdParamDto): Promise<JoinreqResDto> {
        return this.joinreqService.approveJoinRequest(params.id)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('/:id/reject')
    async rejectJoinRequest(@Param() params: GetIdParamDto): Promise<JoinreqResDto> {
        return this.joinreqService.rejectJoinRequest(params.id)
    }
}
