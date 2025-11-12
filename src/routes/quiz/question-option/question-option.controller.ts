import { Body, Controller, Delete, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import type { IQuestionOptionService } from './services/question-option.interface.service';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ZodSerializerDto } from 'nestjs-zod';
import { QuestionOptionResDto } from './dtos/responses/question-option-res.dto';
import { CreateQuestionOptionReqDto } from './dtos/requests/create-question-option-req.dto';
import { UpdateQuestionOptionReqDto } from './dtos/requests/update-question-option-req.dto';
import { DeleteQuestionOptionReqDto } from './dtos/requests/delete-question-option-req.dto';
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto';
import { ResponseMessage } from 'src/shared/types/response-message.type';
import { AttachMediaToQuestionOptionReqDto } from './dtos/requests/attach-media-req.dto';
import { DetachMediaFromQuestionOptionReqDto } from './dtos/requests/detach-media-req.dto';

@UseGuards(RoleGuard)
@Controller('question/:id/option')
export class QuestionOptionController {
    constructor(
        @Inject('IQuestionOptionService')
        private readonly questionOptionService: IQuestionOptionService
    ) {}

    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(QuestionOptionResDto)
    async createOption(@Param() param: GetIdParamDto, @Body() body: CreateQuestionOptionReqDto): Promise<QuestionOptionResDto> {
        return this.questionOptionService.create(param.id, body);
    }

    @Roles(Role.admin)
    @Put()
    @ZodSerializerDto(QuestionOptionResDto)
    async updateOption(@Body() body: UpdateQuestionOptionReqDto): Promise<QuestionOptionResDto> {
        return this.questionOptionService.update(body);
    }

    @Roles(Role.admin)
    @Delete()
    async deleteOption(@Body() body: DeleteQuestionOptionReqDto): Promise<ResponseMessage> {
        return this.questionOptionService.delete(body.id);
    }

    @Roles(Role.admin)
    @Post('attach-media')
    async attachMedia(@Body() body: AttachMediaToQuestionOptionReqDto): Promise<ResponseMessage> {
        return this.questionOptionService.attachMedias(body.optionId, body.mediaIds);
    }

    @Roles(Role.admin)
    @Post('detach-media')
    async detachMedia(@Body() body: DetachMediaFromQuestionOptionReqDto): Promise<ResponseMessage> {
        return this.questionOptionService.detachMedias(body.optionId, body.mediaIds);
    }
}
