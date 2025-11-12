import { Module } from '@nestjs/common'
import { QuestionGroupController } from './question-group.controller'
import { QuestionGroupService } from './services/question-group.service'
import { QuestionGroupRepo } from './repos/question-group.repo'

@Module({
    controllers: [QuestionGroupController],
    providers: [
        {
            provide: 'IQuestionGroupService',
            useClass: QuestionGroupService,
        },
        {
            provide: 'IQuestionGroupRepo',
            useClass: QuestionGroupRepo,
        },
    ],
    exports: ['IQuestionGroupService'],
})
export class QuestionGroupModule {}
