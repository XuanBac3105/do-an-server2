import { Body, Controller, Delete, Inject, Param, Post, Put, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { ZodSerializerDto } from 'nestjs-zod'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { GetIdParamDto } from 'src/shared/dtos/get-id-param.dto'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { CreateQuizSectionReqDto } from './dtos/requests/create-quiz-section-req.dto'
import { DeleteQuizSectionReqDto } from './dtos/requests/delete-quiz-section-req.dto'
import { UpdateQuizSectionReqDto } from './dtos/requests/update-quiz-section-req.dto'
import { QuizSectionResDto } from './dtos/responses/quiz-section-res.dto'
import type { IQuizSectionService } from './services/quiz-section.interface.service'

@UseGuards(RoleGuard)
@Controller('quiz/:id/quiz-section')
export class QuizSectionController {
    constructor(
        @Inject('IQuizSectionService')
        private readonly quizSectionService: IQuizSectionService,
    ) {}

    @Roles(Role.admin)
    @Post()
    @ZodSerializerDto(QuizSectionResDto)
    async create(
        @Param() params: GetIdParamDto,
        @Body() body: CreateQuizSectionReqDto,
    ): Promise<QuizSectionResDto> {
        return await this.quizSectionService.create(params.id, body)
    }

    @Roles(Role.admin)
    @Put()
    @ZodSerializerDto(QuizSectionResDto)
    async update(@Body() body: UpdateQuizSectionReqDto): Promise<QuizSectionResDto> {
        return await this.quizSectionService.update(body)
    }

    @Roles(Role.admin)
    @Delete()
    async delete(@Body() body: DeleteQuizSectionReqDto): Promise<ResponseMessage> {
        return await this.quizSectionService.delete(body.id)
    }
}
