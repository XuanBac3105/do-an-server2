import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthRepo } from './repos/auth.repo'
import { AuthService } from './services/auth.service'

@Module({
    controllers: [AuthController],
    providers: [
        {
            provide: 'IAuthService',
            useClass: AuthService,
        },
        {
            provide: 'IAuthRepo',
            useClass: AuthRepo,
        },
    ],
})
export class AuthModule {}
