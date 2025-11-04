import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { SharedUserRepo } from './repos/shared-user.repo'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { HashingService } from './services/hashing.service'
import { EmailService } from './services/email.service'
import { MinioService } from './services/minio.service'

const sharedServices = [
    PrismaService,
    SharedUserRepo,
    TokenService,
    HashingService,
    EmailService,
    MinioService,
]

@Global()
@Module({
    imports: [JwtModule],
    providers: sharedServices,
    exports: sharedServices,
})
export class SharedModule {}
