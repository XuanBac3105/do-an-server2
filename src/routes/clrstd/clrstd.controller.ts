import { Body, Controller, Delete, Inject, Put, UseGuards } from '@nestjs/common'
import { RoleGuard } from 'src/shared/guards/role.guard'
import { Role } from '@prisma/client'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { UpdateClrStdDto } from './dtos/requests/update-clrstd.dto'
import type { IClrstdService } from './services/clrstd.interface.service'

@Controller('classroom-student')
export class ClrstdController {
    constructor(
        @Inject('IClrstdService')
        private readonly clrstdService: IClrstdService
    ) {}

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('deactivate')
    async deactivate(@Body() body: UpdateClrStdDto): Promise<ResponseMessage> {
        return this.clrstdService.deactivate(body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Put('activate')
    async activate(@Body() body: UpdateClrStdDto): Promise<ResponseMessage> {
        return this.clrstdService.activate(body)
    }

    @UseGuards(RoleGuard)
    @Roles(Role.admin)
    @Delete('delete-student')
    async deleteStudent(@Body() body: UpdateClrStdDto): Promise<ResponseMessage> {
        return this.clrstdService.deleteStudent(body)
    }
}
