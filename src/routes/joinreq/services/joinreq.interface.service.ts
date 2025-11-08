import { ResponseMessage } from "src/shared/types/response-message.type";
import { CreateJoinreqReqType } from "../dtos/requests/create-joinreq.dto";
import { JoinedClassroomListResType, JoinreqClassroomListResType } from "../dtos/responses/joinreq-classroom-list-res.dto";
import { JoinreqResType } from "../dtos/responses/joinreq-res.dto";
import { GetJoinreqClassroomsQueryType } from "../dtos/queries/get-joinreq-classrooms.dto";

export interface IJoinreqService {
    createJoinRequest(id: number, body: CreateJoinreqReqType): Promise<JoinreqResType>
    
    approveJoinRequest(id: number): Promise<JoinreqResType>
    
    rejectJoinRequest(id: number): Promise<JoinreqResType>
    
    studentViewClassrooms(
        studentId: number,
        query: GetJoinreqClassroomsQueryType,
    ): Promise<JoinreqClassroomListResType>

    studentViewJoinedClassrooms(
        studentId: number,
        query: GetJoinreqClassroomsQueryType,
    ): Promise<JoinedClassroomListResType>

    leaveClassroom(studentId: number, classroomId: number): Promise<ResponseMessage>
}