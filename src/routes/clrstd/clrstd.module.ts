import { Module } from '@nestjs/common'
import { ClrstdController } from './clrstd.controller'
import { ClrstdService } from './services/clrstd.service'

@Module({
    controllers: [ClrstdController],
    providers: [
        {
            provide: 'IClrstdService',
            useClass: ClrstdService,
        }
    ],
})
export class ClrstdModule {}
