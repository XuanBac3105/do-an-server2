import { Module } from '@nestjs/common'
import { ExerciseController } from './exercise.controller'
import { ExerciseService } from './services/exercise.service'
import { ExerciseRepo } from './repos/exercise.repo'

@Module({
    controllers: [ExerciseController],
    providers: [
        {
            provide: 'IExerciseService',
            useClass: ExerciseService,
        },
        {
            provide: 'IExerciseRepo',
            useClass: ExerciseRepo,
        },
    ],
})
export class ExerciseModule {}


