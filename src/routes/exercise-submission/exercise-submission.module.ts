import { Module } from '@nestjs/common';
import { ExerciseSubmissionController } from './exercise-submission.controller';
import { ExerciseSubmissionService } from './services/exercise-submission.service';
import { ExerciseSubmissionRepo } from './repos/exercise-submisison.repo';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ExerciseSubmissionController],
  providers: [
    {
      provide: 'IExerciseSubmissionService',
      useClass: ExerciseSubmissionService,
    },
    {
      provide: 'IExerciseSubmissionRepo',
      useClass: ExerciseSubmissionRepo,
    },
  ],
})
export class ExerciseSubmissionModule {}

