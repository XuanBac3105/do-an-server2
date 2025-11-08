import { Module } from '@nestjs/common'
import { ProfileController } from './profile.controller'
import { ProfileService } from './services/profile.service'

@Module({
    controllers: [ProfileController],
    providers: [
        {
            provide: 'IProfileService',
            useClass: ProfileService,
        },
    ],
})
export class ProfileModule {}
