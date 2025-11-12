import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { Media, Prisma } from '@prisma/client'
import { IMediaRepo } from './media.interface.repo'

@Injectable()
export class MediaRepo implements IMediaRepo {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Tạo media record mới
     */
    async create(data: Prisma.MediaCreateInput): Promise<Media> {
        return await this.prisma.media.create({
            data,
        })
    }

    /**
     * Tìm media theo bucket và objectKey
     */
    async findByBucketAndKey(bucket: string, objectKey: string): Promise<Media | null> {
        return await this.prisma.media.findUnique({
            where: {
                bucket_objectKey: {
                    bucket,
                    objectKey,
                },
            },
        })
    }

    /**
     * Lấy danh sách media theo uploadedBy
     */
    async findByUploader(
        uploaderId: number,
        options?: {
            skip?: number
            take?: number
            includeDeleted?: boolean
        },
    ): Promise<Media[]> {
        return await this.prisma.media.findMany({
            where: {
                uploadedBy: uploaderId,
                deletedAt: options?.includeDeleted ? undefined : null,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: options?.skip,
            take: options?.take,
        })
    }

    /**
     * Lấy danh sách media theo visibility
     */
    async findByVisibility(
        visibility: string,
        options?: {
            skip?: number
            take?: number
        },
    ): Promise<Media[]> {
        return await this.prisma.media.findMany({
            where: {
                visibility,
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: options?.skip,
            take: options?.take,
        })
    }

    /**
     * Soft delete media
     */
    async softDelete(id: number): Promise<Media> {
        return await this.prisma.media.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        })
    }

    /**
     * Hard delete media
     */
    async hardDelete(id: number): Promise<Media> {
        return await this.prisma.media.delete({
            where: { id },
        })
    }

    /**
     * Restore soft deleted media
     */
    async restore(id: number): Promise<Media> {
        return await this.prisma.media.update({
            where: { id },
            data: {
                deletedAt: null,
            },
        })
    }

    /**
     * Update media
     */
    async update(id: number, data: Prisma.MediaUpdateInput): Promise<Media> {
        return await this.prisma.media.update({
            where: { id },
            data,
        })
    }

    /**
     * Đếm số lượng media của user
     */
    async countByUploader(uploaderId: number, includeDeleted: boolean = false): Promise<number> {
        return await this.prisma.media.count({
            where: {
                uploadedBy: uploaderId,
                deletedAt: includeDeleted ? undefined : null,
            },
        })
    }

    /**
     * Tính tổng dung lượng của user
     */
    async getTotalSizeByUploader(uploaderId: number): Promise<bigint> {
        const result = await this.prisma.media.aggregate({
            where: {
                uploadedBy: uploaderId,
                deletedAt: null,
            },
            _sum: {
                sizeBytes: true,
            },
        })

        return result._sum.sizeBytes || BigInt(0)
    }

    /**
     * Tìm media theo mimeType
     */
    async findByMimeType(
        mimeType: string,
        options?: {
            skip?: number
            take?: number
        },
    ): Promise<Media[]> {
        return await this.prisma.media.findMany({
            where: {
                mimeType: {
                    contains: mimeType,
                },
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: options?.skip,
            take: options?.take,
        })
    }

    /**
     * Lấy danh sách media đã bị xóa
     */
    async findDeleted(options?: { skip?: number; take?: number }): Promise<Media[]> {
        return await this.prisma.media.findMany({
            where: {
                deletedAt: {
                    not: null,
                },
            },
            orderBy: {
                deletedAt: 'desc',
            },
            skip: options?.skip,
            take: options?.take,
        })
    }

    /**
     * Batch create
     */
    async createMany(data: Prisma.MediaCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return await this.prisma.media.createMany({
            data,
        })
    }

    /**
     * Batch delete
     */
    async deleteMany(ids: number[]): Promise<Prisma.BatchPayload> {
        return await this.prisma.media.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        })
    }

    /**
     * Tìm media theo disk
     */
    async findByDisk(
        disk: string,
        options?: {
            skip?: number
            take?: number
        },
    ): Promise<Media[]> {
        return await this.prisma.media.findMany({
            where: {
                disk,
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: options?.skip,
            take: options?.take,
        })
    }

    /**
     * Check if media is being used (có relation với entities khác không)
     */
    async isMediaInUse(mediaId: number): Promise<boolean> {
        const media = await this.prisma.media.findUnique({
            where: { id: mediaId },
            include: {
                userAvatars: true,
                classroomCovers: true,
                exerciseAttachments: true,
                exerciseSubmissions: true,
                quizQuestionGroupMedias: true,
                quizQuestionMedias: true,
                quizOptionMedias: true,
                lectures: true,
            },
        })

        if (!media) return false

        return (
            media.userAvatars.length > 0 ||
            media.classroomCovers.length > 0 ||
            media.exerciseAttachments.length > 0 ||
            media.exerciseSubmissions.length > 0 ||
            media.quizQuestionGroupMedias.length > 0 ||
            media.quizQuestionMedias.length > 0 ||
            media.quizOptionMedias.length > 0 ||
            media.lectures.length > 0
        )
    }
}
