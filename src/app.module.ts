import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AuthModule } from './routes/auth/auth.module'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { ThrottlerModule } from '@nestjs/throttler'
import { CustomThrottlerGuard } from './shared/guards/throttler.guard'
import { AccessTokenGuard } from './shared/guards/access-token.guard'
import { ProfileModule } from './routes/profile/profile.module';

@Module({
    imports: [
        SharedModule,
        AuthModule,
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 10,
            },
        ]),
        ProfileModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_PIPE,
            useClass: CustomZodValidationPipe,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ZodSerializerInterceptor,
        },
        {
            provide: APP_GUARD,
            useClass: CustomThrottlerGuard,
        },
        {
            provide: APP_GUARD,
            useClass: AccessTokenGuard,
        },
    ],
})
export class AppModule {}
