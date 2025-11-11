import { Body, Controller, Delete, Inject, Param, Post, Put, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { ZodSerializerDto } from 'nestjs-zod'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { CreateQuestionGroupReqDto } from './dtos/requests/create-question-group-req.dto'
import { DeleteQuestionGroupReqDto } from './dtos/requests/delete-question-group-req.dto'
import { UpdateQuestionGroupReqDto } from './dtos/requests/update-question-group-req.dto'
import { QuestionGroupResDto } from './dtos/responses/question-group-res.dto'
import type { IQuestionGroupService } from './services/question-group.interface.service'

@Controller('quiz/:id/question-group')
export class QuestionGroupController {
    constructor(
        @Inject('IQuestionGroupService')
        private readonly questionGroupService: IQuestionGroupService,
    ) {}

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(QuestionGroupResDto)
    async create(
        @Param() param: GetIdParamDto,
        @Body() body: CreateQuestionGroupReqDto,
    ): Promise<QuestionGroupResDto> {
        return await this.questionGroupService.create(param.id, body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put()
    @ZodSerializerDto(QuestionGroupResDto)
    async update(@Body() body: UpdateQuestionGroupReqDto): Promise<QuestionGroupResDto> {
        return await this.questionGroupService.update(body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Delete()
    async delete(@Body() body: DeleteQuestionGroupReqDto): Promise<ResponseMessage> {
        return await this.questionGroupService.delete(body.id)
    }
}