import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Inject } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { Role } from '@prisma/client'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { GetClassroomsQueryDto } from './dtos/queries/get-classrooms.dto'
import { ListClassroomsResDto } from 'src/shared/dtos/list-classrooms-res.dto'
import { ClassroomResDto } from 'src/shared/dtos/classroom-res.dto'
import { CreateClassroomReqDto } from './dtos/requests/create-classroom-req.dto'
import { UpdateClassroomReqDto } from './dtos/requests/update-classroom-req.dto'
import { ClrWithStdJreqDto } from './dtos/responses/clr-with-std-and-jreq.dto'
import type { IClassroomService } from './services/classroom.interface.service'

@Controller('classroom')
export class ClassroomController {
    constructor(@Inject('IClassroomService') private readonly classroomService: IClassroomService) {}

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get()
    @ZodSerializerDto(ListClassroomsResDto)
    async getAllClassrooms(@Query() query: GetClassroomsQueryDto): Promise<ListClassroomsResDto> {
        return this.classroomService.getAllClassrooms(query)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get('deleted-list')
    @ZodSerializerDto(ListClassroomsResDto)
    async getDeletedClassrooms(@Query() query: GetClassroomsQueryDto): Promise<ListClassroomsResDto> {
        return this.classroomService.getDeletedClassrooms(query)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get(':id')
    @ZodSerializerDto(ClrWithStdJreqDto)
    async getClassroomById(@Param() params: GetIdParamDto): Promise<ClrWithStdJreqDto> {
        return this.classroomService.getClassroomById(params.id)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(ClassroomResDto)
    async createClassroom(@Body() body: CreateClassroomReqDto): Promise<ClassroomResDto> {
        return this.classroomService.createClassroom(body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('restore/:id')
    @ZodSerializerDto(ClassroomResDto)
    async restoreClassroom(@Param() params: GetIdParamDto): Promise<ClassroomResDto> {
        return this.classroomService.restoreClassroom(params.id)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put(':id')
    @ZodSerializerDto(ClassroomResDto)
    async updateClassroom(
        @Param() params: GetIdParamDto,
        @Body() body: UpdateClassroomReqDto,
    ): Promise<ClassroomResDto> {
        return this.classroomService.updateClassroom(params.id, body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Delete(':id')
    async deleteClassroom(@Param() params: GetIdParamDto): Promise<ResponseMessage> {
        return this.classroomService.deleteClassroom(params.id)
    }
}
