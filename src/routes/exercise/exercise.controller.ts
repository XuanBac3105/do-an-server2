import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import type { IExerciseService } from './services/exercise.interface.service'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { Role } from '@prisma/client'
import { CreateExerciseReqDto } from './dtos/requests/create-exercise-req.dto'
import { ExerciseResDto } from './dtos/responses/exercise-res.dto'
import { GetListExercisesQueryDto } from './dtos/queries/get-exercises.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ListExercisesResDto } from './dtos/responses/list-exercises-res.dto'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { UpdateExerciseReqDto } from './dtos/requests/update-exercise-req.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type'

@Controller('exercise')
export class ExerciseController {
    constructor(
        @Inject('IExerciseService')
        private readonly exerciseService: IExerciseService,
    ) {}

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(ExerciseResDto)
    async createExercise(@Body() body: CreateExerciseReqDto): Promise<ExerciseResDto> {
        return this.exerciseService.create(body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get()
    @ZodSerializerDto(ListExercisesResDto)
    async getExercises(@Query() query: GetListExercisesQueryDto): Promise<ListExercisesResDto> {
        return this.exerciseService.getAll(query)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Get(':id')
    @ZodSerializerDto(ExerciseResDto)
    async getExercise(@Param() param: GetIdParamDto): Promise<ExerciseResDto> {
        return this.exerciseService.getById(param.id)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put(':id')
    @ZodSerializerDto(ExerciseResDto)
    async updateExercise(@Param() param: GetIdParamDto, @Body() body: UpdateExerciseReqDto): Promise<ExerciseResDto> {
        return this.exerciseService.update(param.id, body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Delete(':id')
    @ZodSerializerDto(ExerciseResDto)
    async deleteExercise(@Param() param: GetIdParamDto): Promise<ResponseMessage> {
        return this.exerciseService.delete(param.id)
    }
}
