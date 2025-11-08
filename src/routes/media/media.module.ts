import { Module } from '@nestjs/common'
import { MediaController } from './media.controller'
import { MediaService } from './services/media.service'
import { MediaRepo } from './repos/media.repo'

@Module({
    controllers: [MediaController],
    providers: [
        {
            provide: 'IMediaService',
            useClass: MediaService,
        },
        {
            provide: 'IMediaRepo',
            useClass: MediaRepo,
        },
    ],
})
export class MediaModule {}

