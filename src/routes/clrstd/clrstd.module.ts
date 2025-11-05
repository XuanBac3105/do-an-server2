import { Module } from '@nestjs/common';
import { ClrstdController } from './clrstd.controller';
import { ClrstdService } from './clrstd.service';

@Module({
  controllers: [ClrstdController],
  providers: [ClrstdService]
})
export class ClrstdModule {}
