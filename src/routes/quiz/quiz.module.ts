import { Module } from '@nestjs/common'
import { QuizController } from './quiz.controller'
import { QuizService } from './core/services/quiz.service'
import { QuizRepo } from './core/repos/quiz.repo'
import { QuestionGroupModule } from './question-group/question-group.module'
import { QuizSectionModule } from './quiz-section/quiz-section.module'
import { QuestionModule } from './question/question.module';
import { QuestionOptionModule } from './question-option/question-option.module';

@Module({
    imports: [
        QuestionGroupModule,
        QuizSectionModule,
        QuestionModule,
        QuestionOptionModule,
    ],
    controllers: [QuizController],
    providers: [
        {
            provide: 'IQuizService',
            useClass: QuizService,
        },
        {
            provide: 'IQuizRepo',
            useClass: QuizRepo,
        },
    ],
    exports: ['IQuizService'],
})
export class QuizModule {}
