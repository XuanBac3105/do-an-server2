import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import type { IQuizService } from './core/services/quiz.interface.service'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { Role } from '@prisma/client'
import { CreateQuizReqDto } from './core/dtos/requests/create-quiz-req.dto'
import { QuizResDto } from './core/dtos/responses/quiz-res.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ListQuizzesResDto } from './core/dtos/responses/list-quizzes-res.dto'
import { GetQuizzesQueryDto } from './core/dtos/queries/get-quizzes.dto'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { UpdateQuizReqDto } from './core/dtos/requests/update-quiz-req.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { QuizDetailResDto } from './core/dtos/responses/quiz-detail-res.dto'

@UseGuards(RoleGuard)
@Controller('quiz')
export class QuizController {
    constructor(
        @Inject('IQuizService')
        private readonly quizService: IQuizService,
    ) {}

    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(QuizResDto)
    async create(@Body() body: CreateQuizReqDto): Promise<QuizResDto> {
        return await this.quizService.create(body)
    }

    @Roles(Role.admin)
    @Get()
    @ZodSerializerDto(ListQuizzesResDto)
    async getAll(@Query() query: GetQuizzesQueryDto): Promise<ListQuizzesResDto> {
        return await this.quizService.getAll(query)
    }

    @Roles(Role.admin)
    @Get(':id')
    @ZodSerializerDto(QuizDetailResDto)
    async getById(@Param() params: GetIdParamDto): Promise<QuizDetailResDto> {
        return await this.quizService.getById(params.id)
    }

    @Roles(Role.admin)
    @Put(':id')
    @ZodSerializerDto(QuizResDto)
    async update(@Param() params: GetIdParamDto, @Body() body: UpdateQuizReqDto): Promise<QuizResDto> {
        return await this.quizService.update(params.id, body)
    }

    @Roles(Role.admin)
    @Delete(':id')
    async delete(@Param() params: GetIdParamDto): Promise<ResponseMessage> {
        return await this.quizService.delete(params.id)
    }
}
