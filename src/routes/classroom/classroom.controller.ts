import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { ResponseMessage } from 'src/shared/types/response-message.type';
import {
    GetListClassroomsQueryDto,
    ClassroomResDto,
    ListClassroomsResDto,
    UpdateClassroomReqDto,
    CreateClassroomReqDto,
    ClassroomWithStdJreqDto
} from './classroom.dto';
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto';

@Controller('classroom')
export class ClassroomController {
    constructor(
        private readonly classroomService: ClassroomService
    ) {}

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get()
    @ZodSerializerDto(ListClassroomsResDto)
    async getAllClassrooms(@Query() query: GetListClassroomsQueryDto): Promise<ListClassroomsResDto> {
        return this.classroomService.getAllClassrooms(query);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get('deleted-list')
    @ZodSerializerDto(ListClassroomsResDto)
    async getDeletedClassrooms(@Query() query: GetListClassroomsQueryDto): Promise<ListClassroomsResDto> {
        return this.classroomService.getDeletedClassrooms(query);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get(':id')
    @ZodSerializerDto(ClassroomWithStdJreqDto)
    async getClassroomById(@Param() params: GetIdParamDto): Promise<ClassroomWithStdJreqDto> {
        return this.classroomService.getClassroomById(params.id);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(ClassroomResDto)
    async createClassroom(@Body() body: CreateClassroomReqDto): Promise<ClassroomResDto> {
        return this.classroomService.createClassroom(body);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('restore/:id')
    @ZodSerializerDto(ClassroomResDto)
    async restoreClassroom(@Param() params: GetIdParamDto): Promise<ClassroomResDto> {
        return this.classroomService.restoreClassroom(params.id);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put(':id')
    @ZodSerializerDto(ClassroomResDto)
    async updateClassroom(@Param() params: GetIdParamDto, @Body() body: UpdateClassroomReqDto): Promise<ClassroomResDto> {
        return this.classroomService.updateClassroom(params.id, body);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Delete(':id')
    async deleteClassroom(@Param() params: GetIdParamDto): Promise<ResponseMessage> {
        return this.classroomService.deleteClassroom(params.id);
    }

    
}