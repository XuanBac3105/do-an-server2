import { Body, Controller, Get, Post, Query, UseGuards, Param, Delete, Put, Inject } from '@nestjs/common'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { Role } from '@prisma/client'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { LectureResDto } from './dtos/responses/lecture-res.dto'
import { ListLecturesResDto } from './dtos/responses/list-lectures-res.dto'
import { GetListLecturesQueryDto } from './dtos/queries/get-lectures.dto'
import { CreateLectureReqDto } from './dtos/requests/create-lecture-req.dto'
import { UpdateLectureReqDto } from './dtos/requests/update-lecture-req.dto'
import type { ILectureService } from './services/lecture.interface.service'

@Controller('lecture')
export class LectureController {
    constructor(@Inject('ILectureService') private readonly lectureService: ILectureService) {}

    @Get()
    @ZodSerializerDto(ListLecturesResDto)
    async getLectureList(@Query() query: GetListLecturesQueryDto): Promise<ListLecturesResDto> {
        return this.lectureService.getLectureList(query)
    }

    @Get(':id')
    @ZodSerializerDto(LectureResDto)
    async getLectureById(@Param() params: GetIdParamDto): Promise<LectureResDto> {
        return this.lectureService.getLectureById(params.id)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(LectureResDto)
    async createLecture(@Body() body: CreateLectureReqDto): Promise<LectureResDto> {
        return this.lectureService.createLecture(body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put(':id')
    @ZodSerializerDto(LectureResDto)
    async updateLecture(@Param() params: GetIdParamDto, @Body() body: UpdateLectureReqDto): Promise<LectureResDto> {
        return this.lectureService.updateLecture(params.id, body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Delete(':id')
    async deleteLecture(@Param() params: GetIdParamDto): Promise<ResponseMessage> {
        return this.lectureService.deleteLecture(params.id)
    }
}
