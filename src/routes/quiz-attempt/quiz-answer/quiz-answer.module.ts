import { Module } from '@nestjs/common';
import { QuizAnswerController } from './quiz-answer.controller';
import { QuizAnswerService } from './services/quiz-answer.service';
import { QuizAnswerRepo } from './repos/quiz-answer.repo';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [QuizAnswerController],
  providers: [
    QuizAnswerRepo,
    {
      provide: 'IQuizAnswerService',
      useClass: QuizAnswerService,
    },
    {
      provide: 'IQuizAnswerRepo',
      useClass: QuizAnswerRepo,
    }
  ],
  exports: ['IQuizAnswerService'],
})
export class QuizAnswerModule {}
