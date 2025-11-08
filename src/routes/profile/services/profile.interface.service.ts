import { UserResType } from 'src/shared/types/user-res.type'
import { UpdateProfileReqType } from '../dtos/requests/update-profile-req.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { ChangePasswordReqType } from '../dtos/requests/change-password-req.dto'

export interface IProfileService {
    updateProfile(userId: number, data: UpdateProfileReqType): Promise<UserResType>
    changePassword(userId: number, data: ChangePasswordReqType): Promise<ResponseMessage>
}
