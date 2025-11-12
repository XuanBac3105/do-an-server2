import { Module } from '@nestjs/common'
import { LessonService } from './services/lesson.service'
import { LessonController } from './lesson.controller'
import { LessonRepo } from './repos/lesson.repo'

@Module({
    controllers: [LessonController],
    providers: [
        {
            provide: 'ILessonService',
            useClass: LessonService,
        },
        {
            provide: 'ILessonRepo',
            useClass: LessonRepo,
        },
    ],
})
export class LessonModule {}
