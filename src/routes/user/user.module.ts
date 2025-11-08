import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './services/user.service'
import { UserRepo } from './repos/user.repo'

@Module({
    controllers: [UserController],
    providers: [
        {
            provide: 'IUserService',
            useClass: UserService,
        },
        {
            provide: 'IUserRepo',
            useClass: UserRepo,
        },
    ],
})
export class UserModule {}
