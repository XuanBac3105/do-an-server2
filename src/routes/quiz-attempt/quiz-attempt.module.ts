import { Module } from '@nestjs/common';
import { QuizAnswerModule } from './quiz-answer/quiz-answer.module';

@Module({
  imports: [QuizAnswerModule]
})
export class QuizAttemptModule {}
