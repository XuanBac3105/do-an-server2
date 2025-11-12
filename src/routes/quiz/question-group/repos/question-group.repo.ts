import { Injectable } from '@nestjs/common'
import { QuizQuestionGroup } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import type { IQuestionGroupRepo } from './question-group.interface.repo'
import { ResponseMessage } from 'src/shared/types/response-message.type'

@Injectable()
export class QuestionGroupRepo implements IQuestionGroupRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async create(data: {
        sectionId?: number
        quizId: number
        title?: string
        introText?: string
        orderIndex?: number
        shuffleInside?: boolean
    }): Promise<QuizQuestionGroup> {
        return this.prismaService.quizQuestionGroup.create({
            data: {
                sectionId: data.sectionId ?? null,
                quizId: data.quizId,
                title: data.title ?? null,
                introText: data.introText ?? null,
                orderIndex: data.orderIndex ?? 0,
                shuffleInside: data.shuffleInside ?? false,
            },
        })
    }

    async findById(id: number, includeMedias: boolean = false): Promise<QuizQuestionGroup | null> {
        return this.prismaService.quizQuestionGroup.findUnique({
            where: { id },
            include: includeMedias ? {
                medias: {
                    include: {
                        media: {
                            include: {
                                uploader: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        role: true,
                                    }
                                }
                            }
                        }
                    }
                }
            } : undefined
        })
    }

    async update(data: Partial<QuizQuestionGroup>): Promise<QuizQuestionGroup> {
        return this.prismaService.quizQuestionGroup.update({
            where: { id: data.id },
            data,
        })
    }

    async delete(id: number): Promise<void> {
        await this.prismaService.quizQuestionGroup.delete({
            where: { id },
        })
    }

    async attachMedias(groupId: number, mediaIds: number[]): Promise<ResponseMessage> {
        await this.prismaService.quizQuestionGroupMedia.createMany({
            data: mediaIds.map(mediaId => ({
                groupId,
                mediaId
            })),
            skipDuplicates: true
        });

        return { message: 'Đính kèm media thành công' };
    }

    async detachMedias(groupId: number, mediaIds: number[]): Promise<ResponseMessage> {
        await this.prismaService.quizQuestionGroupMedia.deleteMany({
            where: {
                groupId,
                mediaId: { in: mediaIds }
            }
        });

        return { message: 'Gỡ media thành công' };
    }

    async getMedias(groupId: number): Promise<any[]> {
        const medias = await this.prismaService.quizQuestionGroupMedia.findMany({
            where: { groupId },
            include: {
                media: {
                    include: {
                        uploader: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                role: true,
                            }
                        }
                    }
                }
            }
        });

        return medias.map(m => m.media);
    }
}
