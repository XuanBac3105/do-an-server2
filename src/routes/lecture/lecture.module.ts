import { Module } from '@nestjs/common';
import { LectureController } from './lecture.controller';
import { LectureService } from './lecture.service';
import { LectureRepo } from './lecture.repo';

@Module({
  controllers: [LectureController],
  providers: [LectureService, LectureRepo]
})
export class LectureModule {}
