import { Lecture } from '@prisma/client'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { CreateLectureReqType } from '../dtos/requests/create-lecture-req.dto'
import { GetListLecturesQueryType } from '../dtos/queries/get-lectures.dto'
import { ListLecturesResType } from '../dtos/responses/list-lectures-res.dto'
import { UpdateLectureReqType } from '../dtos/requests/update-lecture-req.dto'
import { LectureResDto } from '../dtos/responses/lecture-res.dto'

export interface ILectureService {
    createLecture(data: CreateLectureReqType): Promise<Lecture>
    getLectureList(query: GetListLecturesQueryType): Promise<ListLecturesResType>
    getLectureById(id: number): Promise<LectureResDto>
    updateLecture(id: number, data: UpdateLectureReqType): Promise<Lecture>
    deleteLecture(id: number): Promise<ResponseMessage>
}
