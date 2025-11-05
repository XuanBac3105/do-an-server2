import { Module } from '@nestjs/common';
import { JoinreqController } from './joinreq.controller';
import { JoinreqService } from './joinreq.service';
import { JoinreqRepo } from './joinreq.repo';

@Module({
  controllers: [JoinreqController],
  providers: [JoinreqService, JoinreqRepo]
})
export class JoinreqModule {}
