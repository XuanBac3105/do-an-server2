import { Body, Controller, Delete, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import type { IQuizAnswerService } from './services/quiz-answer.interface.service';
import { CreateQuizAnswerReqDto } from './dtos/requests/create-quiz-answer-req.dto';
import { QuizAnswerResDto } from './dtos/responses/quiz-answer-res.dto';
import { ResponseMessage } from 'src/shared/types/response-message.type';
import { QuizAnswerAttemptParamDto, QuizAnswerParamDto } from './dtos/params/quiz-answer-param.dto';
import { GetUserParamDto } from 'src/shared/dtos/get-user-param.dto';

@UseGuards(RoleGuard)
@Controller('quiz-attempts/:attemptId/answers')
export class QuizAnswerController {
    constructor(
        @Inject('IQuizAnswerService')
        private readonly quizAnswerService: IQuizAnswerService
    ) {}

    @Roles(Role.student)
    @Post()
    @ZodSerializerDto(QuizAnswerResDto)
    async upsertAnswer(
        @CurrentUser() user: GetUserParamDto,
        @Param() params: QuizAnswerAttemptParamDto,
        @Body() body: CreateQuizAnswerReqDto
    ): Promise<QuizAnswerResDto> {
        return this.quizAnswerService.upsertAnswer(user.id, params.attemptId, body);
    }

    @Roles(Role.student)
    @Delete(':questionId')
    async deleteAnswer(
        @CurrentUser() user: GetUserParamDto,
        @Param() params: QuizAnswerParamDto
    ): Promise<ResponseMessage> {
        return this.quizAnswerService.deleteAnswer(user.id, params.attemptId, params.questionId);
    }
}