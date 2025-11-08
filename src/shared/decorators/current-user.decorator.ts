import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_USER_KEY } from '../constants/auth.constant'
import { User } from '@prisma/client'

export const CurrentUser = createParamDecorator((data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user: User = request[REQUEST_USER_KEY]
    return data ? user?.[data] : user
})
