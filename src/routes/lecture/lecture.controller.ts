import { Body, Controller, Get, Post, Query, UseGuards, Param, Delete, Put } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { ZodSerializerDto } from 'nestjs-zod';
import { CreateLectureDto, LectureResDto, LectureTreeResponseDto, LectureListResponseDto, UpdateLectureDto, GetListLecturesQueryDto } from './lecture.dto';
import { Role } from '@prisma/client';
import { ResponseMessage } from 'src/shared/types/response-message.type';
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto';

@Controller('lecture')
export class LectureController {
    constructor(
        private readonly lectureService: LectureService
    ) {}

    @Get()
    @ZodSerializerDto(LectureListResponseDto)
    async getLectureList(@Query() query: GetListLecturesQueryDto): Promise<LectureListResponseDto> {
        return this.lectureService.getLectureList(query);
    }

    @Get('tree')
    @ZodSerializerDto(LectureTreeResponseDto)
    async getLectureTree(): Promise<LectureTreeResponseDto> {
        return this.lectureService.getLectureTree();
    }

    @Get(':id')
    @ZodSerializerDto(LectureResDto)
    async getLectureById(@Param() params: GetIdParamDto): Promise<LectureResDto> {
        return this.lectureService.getLectureById(params.id);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(LectureResDto)
    async createLecture(@Body() body: CreateLectureDto): Promise<LectureResDto> {
        return this.lectureService.createLecture(body);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put(':id')
    @ZodSerializerDto(LectureResDto)
    async updateLecture(
        @Param() params: GetIdParamDto,
        @Body() body: UpdateLectureDto
    ): Promise<LectureResDto> {
        return this.lectureService.updateLecture(params.id, body);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Delete(':id')
    async deleteLecture(@Param() params: GetIdParamDto): Promise<ResponseMessage> {
        return this.lectureService.deleteLecture(params.id);
    }
}
