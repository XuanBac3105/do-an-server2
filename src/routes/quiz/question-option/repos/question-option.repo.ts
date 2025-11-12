import { QuizOption } from "@prisma/client";
import { IQuestionOptionRepo } from "./question-option.interface.repo";
import { PrismaService } from "src/shared/services/prisma.service";
import { Injectable } from "@nestjs/common";
import { ResponseMessage } from "src/shared/types/response-message.type";

@Injectable()
export class QuestionOptionRepo implements IQuestionOptionRepo {
    constructor(
        private readonly prismaService: PrismaService
    ) {}
    
    create(data: {
        questionId: number,
        content: string,
        isCorrect?: boolean,
        orderIndex?: number,
    }): Promise<QuizOption> {
        return this.prismaService.quizOption.create({
            data: {
                questionId: data.questionId,
                content: data.content,
                isCorrect: data.isCorrect ?? false,
                orderIndex: data.orderIndex ?? 0,
            }
        });
    }

    findById(id: number, includeMedias: boolean = false): Promise<QuizOption | null> {
        return this.prismaService.quizOption.findUnique({
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
        });
    }

    update(data: {
        id: number,
        content?: string,
        isCorrect?: boolean,
        orderIndex?: number,
    }): Promise<QuizOption> {
        return this.prismaService.quizOption.update({
            where: { id: data.id },
            data: {
                content: data.content,
                isCorrect: data.isCorrect,
                orderIndex: data.orderIndex,
            }
        });
    }

    async delete(id: number): Promise<void> {
        await this.prismaService.quizOption.delete({
            where: { id }
        });
    }

    async attachMedias(optionId: number, mediaIds: number[]): Promise<ResponseMessage> {
        await this.prismaService.quizOptionMedia.createMany({
            data: mediaIds.map(mediaId => ({
                optionId,
                mediaId
            })),
            skipDuplicates: true
        });

        return { message: 'Đính kèm media thành công' };
    }

    async detachMedias(optionId: number, mediaIds: number[]): Promise<ResponseMessage> {
        await this.prismaService.quizOptionMedia.deleteMany({
            where: {
                optionId,
                mediaId: { in: mediaIds }
            }
        });

        return { message: 'Gỡ media thành công' };
    }

    async getMedias(optionId: number): Promise<any[]> {
        const medias = await this.prismaService.quizOptionMedia.findMany({
            where: { optionId },
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
