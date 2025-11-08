import { Module } from '@nestjs/common'
import { JoinreqController } from './joinreq.controller'
import { JoinreqService } from './services/joinreq.service'
import { JoinreqRepo } from './repos/joinreq.repo'

@Module({
    controllers: [JoinreqController],
    providers: [
        {
            provide: 'IJoinreqService',
            useClass: JoinreqService,
        },
        {
            provide: 'IJoinreqRepo',
            useClass: JoinreqRepo,
        },
    ],
})
export class JoinreqModule {}
