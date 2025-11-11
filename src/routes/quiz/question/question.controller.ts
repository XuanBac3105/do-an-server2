import { Body, Controller, Delete, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import type { IQuestionService } from './services/question.interface.service';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ZodSerializerDto } from 'nestjs-zod';
import { QuestionResDto } from './dtos/responses/question-res.dto';
import { CreateQuestionReqDto } from './dtos/requests/create-question-req.dto';
import { UpdateQuestionReqDto } from './dtos/requests/update-question-req.dto';
import { DeleteQuestionReqDto } from './dtos/requests/delete-question-req.dto';
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto';
import { ResponseMessage } from 'src/shared/types/response-message.type';

@Controller('quiz/:id/question')
export class QuestionController {
    constructor(
        @Inject('IQuestionService')
        private readonly questionService: IQuestionService
    ) {}

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(QuestionResDto)
    async createQuestion(@Param() param: GetIdParamDto, @Body() body: CreateQuestionReqDto): Promise<QuestionResDto> {
        return this.questionService.create(param.id, body);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put()
    @ZodSerializerDto(QuestionResDto)
    async updateQuestion(@Body() body: UpdateQuestionReqDto): Promise<QuestionResDto> {
        return this.questionService.update(body);
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Delete()
    async deleteQuestion(@Body() body: DeleteQuestionReqDto): Promise<ResponseMessage> {
        return this.questionService.delete(body.id);
    }
}