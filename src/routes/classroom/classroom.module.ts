import { Module } from '@nestjs/common';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { ClassroomRepo } from './classroom.repo';

@Module({
  controllers: [ClassroomController],
  providers: [ClassroomService, ClassroomRepo],
})
export class ClassroomModule {}