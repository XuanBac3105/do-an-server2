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
import { AttachMediaToQuestionGroupReqDto } from './dtos/requests/attach-media-req.dto'
import { DetachMediaFromQuestionGroupReqDto } from './dtos/requests/detach-media-req.dto'

@UseGuards(RoleGuard)
@Controller('quiz/:id/question-group')
export class QuestionGroupController {
    constructor(
        @Inject('IQuestionGroupService')
        private readonly questionGroupService: IQuestionGroupService,
    ) {}

    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(QuestionGroupResDto)
    async create(
        @Param() param: GetIdParamDto,
        @Body() body: CreateQuestionGroupReqDto,
    ): Promise<QuestionGroupResDto> {
        return await this.questionGroupService.create(param.id, body)
    }

    @Roles(Role.admin)
    @Put()
    @ZodSerializerDto(QuestionGroupResDto)
    async update(@Body() body: UpdateQuestionGroupReqDto): Promise<QuestionGroupResDto> {
        return await this.questionGroupService.update(body)
    }

    @Roles(Role.admin)
    @Delete()
    async delete(@Body() body: DeleteQuestionGroupReqDto): Promise<ResponseMessage> {
        return await this.questionGroupService.delete(body.id)
    }

    @Roles(Role.admin)
    @Post('attach-media')
    async attachMedia(@Body() body: AttachMediaToQuestionGroupReqDto): Promise<ResponseMessage> {
        return await this.questionGroupService.attachMedias(body.groupId, body.mediaIds)
    }

    @Roles(Role.admin)
    @Post('detach-media')
    async detachMedia(@Body() body: DetachMediaFromQuestionGroupReqDto): Promise<ResponseMessage> {
        return await this.questionGroupService.detachMedias(body.groupId, body.mediaIds)
    }
}
