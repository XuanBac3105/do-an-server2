import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './services/question.service';
import { QuestionRepo } from './repos/question.repo';

@Module({
  controllers: [QuestionController],
  providers: [
    {
      provide: 'IQuestionService',
      useClass: QuestionService,
    },
    {
      provide: 'IQuestionRepo',
      useClass: QuestionRepo,
    }
  ],
})
export class QuestionModule {}
