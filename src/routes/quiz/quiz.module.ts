import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizSectionModule } from './quiz-section/quiz-section.module';
import { QuestionGroupModule } from './question-group/question-group.module';

@Module({
  controllers: [QuizController],
  imports: [QuizSectionModule, QuestionGroupModule]
})
export class QuizModule {}
