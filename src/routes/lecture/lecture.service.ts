import { Injectable, NotFoundException } from '@nestjs/common';
import { LectureRepo } from './lecture.repo';
import { Lecture } from '@prisma/client';
import { buildListResponse } from 'src/shared/utils/query.util';
import { ResponseMessage } from 'src/shared/types/response-message.type';
import {
    CreateLectureDto,
    LectureResDto,
    LectureTreeResponseDto,
    LectureListResponseDto,
    UpdateLectureDto,
    GetListLecturesQueryDto
} from './lecture.dto';

interface LectureTreeNode extends Omit<Lecture, 'content'> {
    children: LectureTreeNode[];
}

@Injectable()
export class LectureService {
    constructor(
        private readonly lectureRepo: LectureRepo
    ) {}

    async createLecture(data: CreateLectureDto): Promise<LectureResDto> {
        const lecture = await this.lectureRepo.create({
            parentId: data.parentId ?? null,
            title: data.title,
            content: data.content ?? null,
            mediaId: data.mediaId ?? null,
        });
        return lecture;
    }

    async getLectureTree(): Promise<LectureTreeResponseDto> {
        const allLectures = await this.lectureRepo.findAll();
        
        const lectureMap = new Map<number, LectureTreeNode>();
        const rootLectures: LectureTreeNode[] = [];

        allLectures.forEach(lecture => {
            const { content, ...lectureWithoutContent } = lecture;
            lectureMap.set(lecture.id, {
                ...lectureWithoutContent,
                children: []
            });
        });

        allLectures.forEach(lecture => {
            const node = lectureMap.get(lecture.id)!;
            
            if (lecture.parentId === null) {
                rootLectures.push(node);
            } else {
                const parent = lectureMap.get(lecture.parentId);
                if (parent) {
                    parent.children.push(node);
                } else {
                    rootLectures.push(node);
                }
            }
        });

        return { data: rootLectures };
    }

    async getLectureList(query: GetListLecturesQueryDto): Promise<LectureListResponseDto> {
        const { page, limit, search } = query;
        const { data, total } = await this.lectureRepo.findManyWithPagination({
            page,
            limit,
            search,
        });

        const lecturesWithoutContent = data.map(({ content, ...lecture }) => lecture);

        return buildListResponse(
            page,
            limit,
            total,
            lecturesWithoutContent
        );
    }

    async getLectureById(id: number): Promise<LectureResDto> {
        const lecture = await this.lectureRepo.findById(id);
        if (!lecture) {
            throw new NotFoundException(`Không tìm thấy bài giảng với ID ${id}`);
        }
        return lecture;
    }

    async updateLecture(id: number, data: UpdateLectureDto): Promise<LectureResDto> {
        const existingLecture = await this.lectureRepo.findById(id);
        
        if (!existingLecture) {
            throw new NotFoundException(`Không tìm thấy bài giảng với ID ${id}`);
        }

        const lecture = await this.lectureRepo.update(id, data);
        return lecture;
    }

    async deleteLecture(id: number): Promise<ResponseMessage> {
        const existingLecture = await this.lectureRepo.findById(id);
        if (!existingLecture) {
            throw new NotFoundException(`Không tìm thấy bài giảng với ID ${id}`);
        }
        await this.lectureRepo.softDelete(id);
        return { message: 'Xóa bài giảng thành công' };
    }
}
