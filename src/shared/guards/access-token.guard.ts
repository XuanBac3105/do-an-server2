import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { TokenService } from '../services/token.service'
import { REQUEST_USER_KEY } from '../constants/auth.constant'
import { SharedUserRepo } from '../repos/shared-user.repo'
import { IS_PUBLIC_KEY } from '../constants/is-public.constant'

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(
        private readonly tokenService: TokenService,
        private readonly sharedUserRepo: SharedUserRepo,
        private readonly reflector: Reflector,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])
        if (isPublic) {
            return true
        }

        const request = context.switchToHttp().getRequest()
        const accessToken = request.headers.authorization?.split(' ')[1]
        if (!accessToken) {
            throw new UnauthorizedException('Cần đăng nhập để thực hiện hành động này.')
        }
        try {
            const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)

            // Query full user from database
            const user = await this.sharedUserRepo.findUnique({ id: decodedAccessToken.userId })
            if (!user) {
                throw new UnauthorizedException('Người dùng không tồn tại.')
            }
            if (!user.isActive) {
                throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa.')
            }

            // Exclude sensitive data (passwordHash) before storing in request
            const { passwordHash, ...userWithoutPassword } = user
            request[REQUEST_USER_KEY] = userWithoutPassword
            return true
        } catch (error) {
            throw error
        }
    }
}
