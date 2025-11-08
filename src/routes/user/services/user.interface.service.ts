import { UserResType } from 'src/shared/types/user-res.type'
import { GetUsersQueryType } from '../dtos/queries/get-users-query.dto'
import { ListUsersResType } from '../dtos/responses/list-users-res.dto'
import { ResponseMessage } from 'src/shared/types/response-message.type'

export interface IUserService {
    getAllUsers(query: GetUsersQueryType): Promise<ListUsersResType>
    getUser(id: number): Promise<UserResType>
    deactiveUser(id: number): Promise<ResponseMessage>
    activateUser(id: number): Promise<ResponseMessage>
}
