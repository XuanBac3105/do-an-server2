import { Module } from '@nestjs/common'
import { ClassroomController } from './classroom.controller'
import { ClassroomService } from './services/classroom.service'
import { ClassroomRepo } from './repos/classroom.repo'

@Module({
    controllers: [ClassroomController],
    providers: [
        {
            provide: 'IClassroomService',
            useClass: ClassroomService,
        },
        {
            provide: 'IClassroomRepo',
            useClass: ClassroomRepo,
        },
    ],
})
export class ClassroomModule {}
