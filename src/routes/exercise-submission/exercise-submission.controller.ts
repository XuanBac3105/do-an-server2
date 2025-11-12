import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import type { IExerciseSubmissionService } from './services/exercise-submission.interface.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { SubmitExReqDto } from './dtos/requests/submit-ex-req.dto';
import { ExSubmissionResDto } from './dtos/responses/ex-submissson-res.dto';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUserParamDto } from 'src/shared/dtos/get-user-param.dto';
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto';
import { GradeSubmissionReqDto } from './dtos/requests/grade-submission-req.dto';

@Controller('exercise-submission')
@UseGuards(RoleGuard)
export class ExerciseSubmissionController {
    constructor(
        @Inject('IExerciseSubmissionService')
        private readonly exerciseSubmissionService: IExerciseSubmissionService,
    ) {}

    @Roles(Role.student)
    @Post('submit')
    async submit(
        @CurrentUser() user: GetUserParamDto,
        @Body() body: SubmitExReqDto,
    ): Promise<ExSubmissionResDto> {
        return this.exerciseSubmissionService.submit(user.id, body);
    }

    @Roles(Role.student)
    @Delete(':id')
    async deleteSubmission(
        @CurrentUser() user: GetUserParamDto,
        @Param() param: GetIdParamDto,
    ): Promise<{ message: string }> {
        return this.exerciseSubmissionService.deleteSubmission(user.id, param.id);
    }

    @Roles(Role.admin)
    @Get('lesson/:id')
    async getSubmissionsByLessonId(
        @Param() param: GetIdParamDto,
    ): Promise<ExSubmissionResDto[]> {
        return this.exerciseSubmissionService.getSubmissionsByLessonId(param.id);
    }

    @Roles(Role.admin)
    @Put(':id/grade')
    async gradeSubmission(
        @Param() param: GetIdParamDto,
        @Body() body: GradeSubmissionReqDto,
    ): Promise<ExSubmissionResDto> {
        return this.exerciseSubmissionService.gradeSubmission(param.id, body);
    }
}

