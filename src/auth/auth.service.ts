import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { AuthRepo } from './auth.repo'
import { RegisterReqDto, RegisterResDto } from './auth.dto'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo'
import { AuthType, RegisterReqType } from './auth.type'
import { Role } from '@prisma/client'

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepo: AuthRepo,
        private readonly hashingService: HashingService,
        private readonly sharedUserRepo: SharedUserRepo,
    ) {}

    async register(body: RegisterReqType): Promise<AuthType> {
        const user = await this.sharedUserRepo.findUnique({ email: body.email })
        if (user) {
            throw new UnprocessableEntityException('Email đã được sử dụng')
        }
        const hashedPassword = await this.hashingService.hash(body.password)
        const newUser = await this.sharedUserRepo.createUser({
            fullName: body.fullName,
            email: body.email,
            passwordHash: hashedPassword,
            role: Role.student,
            phone: body.phone,
        })
        return newUser
    }
}
