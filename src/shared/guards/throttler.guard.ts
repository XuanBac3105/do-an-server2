import { ExecutionContext, Injectable } from '@nestjs/common'
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler'

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
        throw new ThrottlerException('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.')
    }
}
