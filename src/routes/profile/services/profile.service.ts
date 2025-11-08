import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { SharedUserRepo } from 'src/shared/repos/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { UpdateProfileReqType } from '../dtos/requests/update-profile-req.dto'
import { UserResType } from 'src/shared/types/user-res.type'
import { ChangePasswordReqType } from '../dtos/requests/change-password-req.dto'
import { IProfileService } from './profile.interface.service'

@Injectable()
export class ProfileService implements IProfileService {
    constructor(
        private readonly sharedUserRepo: SharedUserRepo,
        private readonly hashingService: HashingService,
    ) {}

    async updateProfile(userId: number, data: UpdateProfileReqType): Promise<UserResType> {
        return this.sharedUserRepo.updateUser({
            id: userId,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            avatarMediaId: data.avatarMediaId,
        })
    }

    async changePassword(userId: number, data: ChangePasswordReqType): Promise<ResponseMessage> {
        const user = await this.sharedUserRepo.findUnique({ id: userId })
        if (!user) {
            throw new UnprocessableEntityException('Người dùng không tồn tại')
        }
        const isCurrentPasswordValid = await this.hashingService.compare(data.currentPassword, user.passwordHash)
        if (!isCurrentPasswordValid) {
            throw new UnprocessableEntityException('Mật khẩu hiện tại không đúng')
        }
        const passwordHash = await this.hashingService.hash(data.newPassword)
        await this.sharedUserRepo.updateUser({
            id: userId,
            passwordHash: passwordHash,
        })
        return { message: 'Đổi mật khẩu thành công' }
    }
}
