import { Module } from '@nestjs/common'
import { MediaController } from './media.controller'
import { MediaService } from './media.service'
import { MediaRepo } from './media.repo'

@Module({
    controllers: [MediaController],
    providers: [MediaService, MediaRepo],
    exports: [MediaService, MediaRepo],
})
export class MediaModule {}
