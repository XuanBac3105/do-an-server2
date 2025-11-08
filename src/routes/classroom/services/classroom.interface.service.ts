import { Classroom } from '@prisma/client'
import { GetClassroomsQueryType } from '../dtos/queries/get-classrooms.dto'
import { UpdateClassroomReqType } from '../dtos/requests/update-classroom-req.dto'
import { ClrWithStdJreqType } from '../dtos/responses/clr-with-std-and-jreq.dto'
import { ListClassroomsResType } from 'src/shared/types/list-classrooms-res.type'
import { ResponseMessage } from 'src/shared/types/response-message.type'

export interface IClassroomService {
    getAllClassrooms(query: GetClassroomsQueryType): Promise<ListClassroomsResType>
    getDeletedClassrooms(query: GetClassroomsQueryType): Promise<ListClassroomsResType>
    getClassroomById(id: number): Promise<ClrWithStdJreqType>
    createClassroom(data: UpdateClassroomReqType): Promise<Classroom>
    updateClassroom(id: number, data: UpdateClassroomReqType): Promise<Classroom>
    restoreClassroom(id: number): Promise<Classroom>
    deleteClassroom(id: number): Promise<ResponseMessage>
}
