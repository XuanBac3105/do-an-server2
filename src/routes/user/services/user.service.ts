import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { GetUsersQueryType } from '../dtos/queries/get-users-query.dto'
import { ListUsersResType } from '../dtos/responses/list-users-res.dto'
import { UserResType } from 'src/shared/types/user-res.type'
import { buildListResponse, buildOrderBy, buildSearchFilter, calculatePagination } from 'src/shared/utils/query.util'
import type { IUserRepo } from '../repos/user.interface.repo'
import { IUserService } from './user.interface.service'

@Injectable()
export class UserService implements IUserService {
    constructor(
        @Inject('IUserRepo') private readonly userRepo: IUserRepo,
        private readonly sharedUserRepo: SharedUserRepo,
    ) {}

    async getAllUsers(query: GetUsersQueryType): Promise<ListUsersResType> {
        const { page, limit, order, search, isActive, sortBy } = query

        const where: Prisma.UserWhereInput = {
            ...(typeof isActive === 'boolean' && { isActive }),
            ...buildSearchFilter(search, ['fullName', 'email', 'phoneNumber']),
        }

        const orderBy = buildOrderBy(sortBy, order)

        const { skip, take } = calculatePagination(page, limit)

        const [total, data] = await Promise.all([
            this.userRepo.count(where),
            this.userRepo.findMany(where, orderBy, skip, take),
        ])

        return buildListResponse(page, limit, total, data)
    }

    async getUser(id: number): Promise<UserResType> {
        const user = await this.sharedUserRepo.findUnique({ id })
        if (!user) {
            throw new UnprocessableEntityException('ID người dùng không hợp lệ')
        }
        return user
    }

    async deactiveUser(id: number): Promise<ResponseMessage> {
        const user = await this.sharedUserRepo.findUnique({ id })
        if (!user) {
            throw new UnprocessableEntityException('ID người dùng không hợp lệ')
        }
        await this.sharedUserRepo.updateUser({ id, isActive: false })
        return { message: 'Đã vô hiệu hóa người dùng' }
    }

    async activateUser(id: number): Promise<ResponseMessage> {
        const user = await this.sharedUserRepo.findUnique({ id })
        if (!user) {
            throw new UnprocessableEntityException('ID người dùng không hợp lệ')
        }
        await this.sharedUserRepo.updateUser({ id, isActive: true })
        return { message: 'Đã kích hoạt người dùng' }
    }
}
