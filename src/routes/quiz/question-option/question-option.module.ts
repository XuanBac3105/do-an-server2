import { Module } from '@nestjs/common';
import { QuestionOptionController } from './question-option.controller';
import { QuestionOptionService } from './services/question-option.service';
import { QuestionOptionRepo } from './repos/question-option.repo';
import { SharedModule } from 'src/shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [QuestionOptionController],
    providers: [
        {
            provide: 'IQuestionOptionService',
            useClass: QuestionOptionService,
        },
        {
            provide: 'IQuestionOptionRepo',
            useClass: QuestionOptionRepo,
        },
    ],
})
export class QuestionOptionModule {}
