import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { Role } from '@prisma/client'
import { ZodSerializerDto } from 'nestjs-zod'
import { LessonLectureResDto } from './dtos/responses/lesson-lecture-res.dto'
import { LessonExerciseResDto } from './dtos/responses/lesson-exercise-res.dto'
import { LessonQuizResDto } from './dtos/responses/lesson-quiz-res.dto'
import { AssignLectureReqDto } from './dtos/requests/assign-lecture.dto'
import { AssignExerciseReqDto } from './dtos/requests/assign-exercise.dto'
import { AssignQuizReqDto } from './dtos/requests/assign-quiz.dto'
import type { ILessonService } from './services/lesson.interface.service'
import { GetLessonsByClassroomQueryDto } from './dtos/queries/get-lessons-by-classroom.query'
import { LessonsListResDto } from './dtos/responses/lesson-with-details-res.dto'

@Controller('lesson')
export class LessonController {
    constructor(
        @Inject('ILessonService')
        private readonly lessonService: ILessonService
    ) {}

    @Get()
    @ZodSerializerDto(LessonsListResDto)
    async getLessonsByClassroom(@Query() query: GetLessonsByClassroomQueryDto): Promise<LessonsListResDto> {
        return this.lessonService.getLessonsByClassroom(query)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Post('lecture')
    @ZodSerializerDto(LessonLectureResDto)
    async assignLecture(@Body() body: AssignLectureReqDto): Promise<LessonLectureResDto> {
        return this.lessonService.assignLecture(body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Post('exercise')
    @ZodSerializerDto(LessonExerciseResDto)
    async assignExercise(@Body() body: AssignExerciseReqDto): Promise<LessonExerciseResDto> {
        return this.lessonService.assignExercise(body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Post('quiz')
    @ZodSerializerDto(LessonQuizResDto)
    async assignQuiz(@Body() body: AssignQuizReqDto): Promise<LessonQuizResDto> {
        return this.lessonService.assignQuiz(body)
    }
}
