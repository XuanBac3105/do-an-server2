import { Module } from '@nestjs/common'
import { QuizSectionController } from './quiz-section.controller'
import { QuizSectionService } from './services/quiz-section.service'
import { QuizSectionRepo } from './repos/quiz-section.repo'

@Module({
    controllers: [QuizSectionController],
    providers: [
        {
            provide: 'IQuizSectionService',
            useClass: QuizSectionService,
        },
        {
            provide: 'IQuizSectionRepo',
            useClass: QuizSectionRepo,
        },
    ],
    exports: ['IQuizSectionService'],
})
export class QuizSectionModule {}
