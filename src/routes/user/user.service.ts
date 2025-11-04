import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UserRepo } from './user.repo';
import { GetAllUsersQueryDto, GetUserResDto, ListUsersResDto } from './user.dto';
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo';
import { buildListResponse, buildOrderBy, buildSearchFilter, calculatePagination } from 'src/shared/utils/query.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepo: UserRepo,
        private readonly sharedUserRepo: SharedUserRepo
    ) { }

    async getAllUsers(query: GetAllUsersQueryDto): Promise<ListUsersResDto> {
        const { page, limit, order, search, isActive, sortBy } = query;

        const where: Prisma.UserWhereInput = {
            ...(typeof isActive === 'boolean' && { isActive }),
            ...buildSearchFilter(search, ['fullName', 'email', 'phoneNumber']),
        };

        const orderBy = buildOrderBy(sortBy, order);

        const { skip, take } = calculatePagination(page, limit);

        const [total, data] = await Promise.all([
            this.userRepo.count(where),
            this.userRepo.findMany(where, orderBy, skip, take),
        ]);

        return buildListResponse(page, limit, total, data);
    }

    async getUser(id: number): Promise<GetUserResDto> {
        const user = await this.sharedUserRepo.findUnique({ id });
        if (!user) {
            throw new UnprocessableEntityException('ID người dùng không hợp lệ');
        }
        return user;
    }
}
