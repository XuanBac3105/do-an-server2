import { Module } from '@nestjs/common'
import { LectureController } from './lecture.controller'
import { LectureService } from './services/lecture.service'
import { LectureRepo } from './repos/lecture.repo'

@Module({
    controllers: [LectureController],
    providers: [
        {
            provide: 'ILectureService',
            useClass: LectureService,
        },
        {
            provide: 'ILectureRepo',
            useClass: LectureRepo,
        },
    ],
})
export class LectureModule {}
