import { createZodDto } from 'nestjs-zod'
import { GetList } from 'src/shared/queries/get-list.query'
import z from 'zod'

export enum LectureSortByEnum {
    UPLOADED_AT = 'uploadedAt',
    TITLE = 'title',
}

export const GetListLecturesQuery = GetList.extend({
    sortBy: z.enum(LectureSortByEnum).default(LectureSortByEnum.UPLOADED_AT),
})

export class GetListLecturesQueryDto extends createZodDto(GetListLecturesQuery) {}

export type GetListLecturesQueryType = z.infer<typeof GetListLecturesQuery>
