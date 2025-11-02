import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SharedUserRepo } from '../repos/shared-user.repo'
import { Role } from '@prisma/client'
import { ROLES_KEY } from '../constants/role.constant'
import { REQUEST_USER_KEY } from '../constants/auth.constant'

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly sharedUserRepo: SharedUserRepo,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Lấy danh sách roles được định nghĩa qua decorator @Roles()
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        // Nếu không có roles nào được định nghĩa, cho phép truy cập
        if (!requiredRoles || requiredRoles.length === 0) {
            return true
        }

        // Lấy thông tin user từ request (đã được set bởi AccessTokenGuard)
        const request = context.switchToHttp().getRequest()
        const user = request[REQUEST_USER_KEY]

        if (!user || !user.id) {
            throw new ForbiddenException('Không tìm thấy thông tin người dùng.')
        }

        // Lấy role của user từ database
        const userRole = await this.sharedUserRepo.getRoleNamesByUserId(user.id)

        if (!userRole) {
            throw new ForbiddenException('Vai trò người dùng không hợp lệ.')
        }

        // Kiểm tra xem user có role phù hợp không
        const hasRequiredRole = requiredRoles.includes(userRole)

        if (!hasRequiredRole) {
            throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này.')
        }

        return true
    }
}
