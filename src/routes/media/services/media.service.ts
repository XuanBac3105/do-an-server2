import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common'
import { MinioService } from 'src/shared/services/minio.service'
import { Media } from '@prisma/client'
import type { IMediaRepo } from '../repos/media.interface.repo'
import { IMediaService } from './media.interface.service'
import { SharedMediaRepo } from 'src/shared/repos/shared-media.repo'

@Injectable()
export class MediaService implements IMediaService {
    constructor(
        @Inject('IMediaRepo') private readonly mediaRepo: IMediaRepo,
        private readonly minioService: MinioService,
        private readonly sharedMediaRepo: SharedMediaRepo,
    ) {}

    /**
     * Upload file và tạo media record
     */
    async uploadFile(
        file: Express.Multer.File,
        uploaderId: number,
        visibility: 'public' | 'private' = 'private',
        metadata?: Record<string, string>,
    ): Promise<Media & { url: string }> {
        // Upload file lên MinIO
        const uploadResult = await this.minioService.uploadFile({
            file: file.buffer,
            fileName: file.originalname,
            mimeType: file.mimetype,
            metadata,
        })

        // Tạo media record trong database
        const media = await this.mediaRepo.create({
            disk: 'minio',
            bucket: uploadResult.bucket,
            objectKey: uploadResult.objectKey,
            mimeType: file.mimetype,
            sizeBytes: BigInt(file.size),
            visibility,
            uploader: {
                connect: { id: uploaderId },
            },
        })

        return {
            ...media,
            url: uploadResult.url,
        }
    }

    /**
     * Upload nhiều files
     */
    async uploadMultipleFiles(
        files: Express.Multer.File[],
        uploaderId: number,
        visibility: 'public' | 'private' = 'private',
    ): Promise<Array<Media & { url: string }>> {
        const uploadPromises = files.map((file) => this.uploadFile(file, uploaderId, visibility))
        return await Promise.all(uploadPromises)
    }

    /**
     * Lấy media theo ID
     */
    async getMediaById(id: number, includeRelations: boolean = false): Promise<Media & { url: string }> {
        const media = await this.sharedMediaRepo.findById(id, includeRelations)
        if (!media) {
            throw new NotFoundException('Media không tồn tại')
        }

        const url = this.minioService.getPublicUrl(media.objectKey)

        return {
            ...media,
            url,
        }
    }

    /**
     * Lấy danh sách media của user
     */
    async getMediaByUser(
        uploaderId: number,
        options?: {
            skip?: number
            take?: number
            includeDeleted?: boolean
        },
    ): Promise<Array<Media & { url: string }>> {
        const mediaList = await this.mediaRepo.findByUploader(uploaderId, options)

        return mediaList.map((media) => ({
            ...media,
            url: this.minioService.getPublicUrl(media.objectKey),
        }))
    }

    /**
     * Download file
     */
    async downloadFile(id: number, userId: number, userRole: string) {
        const media = await this.sharedMediaRepo.findById(id)
        if (!media) {
            throw new NotFoundException('Media không tồn tại')
        }

        // Check permission
        if (media.visibility === 'private') {
            if (media.uploadedBy !== userId && userRole !== 'admin') {
                throw new ForbiddenException('Bạn không có quyền tải file này')
            }
        }

        // Get file stream từ MinIO
        const stream = await this.minioService.downloadFile(media.objectKey)
        const stat = await this.minioService.getFileStat(media.objectKey)

        return {
            stream,
            filename: media.objectKey.split('/').pop() || 'download',
            mimeType: media.mimeType || 'application/octet-stream',
            size: stat.size,
        }
    }

    /**
     * Xóa file (soft delete)
     */
    async softDeleteMedia(id: number, userId: number, userRole: string): Promise<Media> {
        const media = await this.sharedMediaRepo.findById(id)
        if (!media) {
            throw new NotFoundException('Media không tồn tại')
        }

        // Check permission
        if (media.uploadedBy !== userId && userRole !== 'admin') {
            throw new ForbiddenException('Bạn không có quyền xóa file này')
        }

        // Check if media is being used
        const isInUse = await this.mediaRepo.isMediaInUse(id)
        if (isInUse) {
            throw new BadRequestException('Không thể xóa file đang được sử dụng')
        }

        return await this.mediaRepo.softDelete(id)
    }

    /**
     * Xóa vĩnh viễn file (hard delete)
     */
    async hardDeleteMedia(id: number, userId: number, userRole: string): Promise<void> {
        const media = await this.sharedMediaRepo.findById(id)
        if (!media) {
            throw new NotFoundException('Media không tồn tại')
        }

        // Check permission
        if (media.uploadedBy !== userId && userRole !== 'admin') {
            throw new ForbiddenException('Bạn không có quyền xóa file này')
        }

        // Check if media is being used
        const isInUse = await this.mediaRepo.isMediaInUse(id)
        if (isInUse) {
            throw new BadRequestException('Không thể xóa file đang được sử dụng')
        }

        // Xóa file khỏi MinIO
        await this.minioService.deleteFile(media.objectKey)

        // Xóa record khỏi database
        await this.mediaRepo.hardDelete(id)
    }

    /**
     * Restore file đã bị soft delete
     */
    async restoreMedia(id: number, userId: number, userRole: string): Promise<Media> {
        const media = await this.sharedMediaRepo.findById(id)
        if (!media) {
            throw new NotFoundException('Media không tồn tại')
        }

        // Check permission
        if (media.uploadedBy !== userId && userRole !== 'admin') {
            throw new ForbiddenException('Bạn không có quyền restore file này')
        }

        return await this.mediaRepo.restore(id)
    }

    /**
     * Update visibility
     */
    async updateVisibility(
        id: number,
        visibility: 'public' | 'private',
        userId: number,
        userRole: string,
    ): Promise<Media> {
        const media = await this.sharedMediaRepo.findById(id)
        if (!media) {
            throw new NotFoundException('Media không tồn tại')
        }

        // Check permission
        if (media.uploadedBy !== userId && userRole !== 'admin') {
            throw new ForbiddenException('Bạn không có quyền thay đổi visibility của file này')
        }

        return await this.mediaRepo.update(id, { visibility })
    }

    /**
     * Đổi tên file
     */
    async renameFile(
        id: number,
        newFileName: string,
        userId: number,
        userRole: string,
    ): Promise<Media & { url: string }> {
        const media = await this.sharedMediaRepo.findById(id)
        if (!media) {
            throw new NotFoundException('Media không tồn tại')
        }

        // Check permission
        if (media.uploadedBy !== userId && userRole !== 'admin') {
            throw new ForbiddenException('Bạn không có quyền đổi tên file này')
        }

        // Tạo object key mới với tên file mới
        const pathParts = media.objectKey.split('/')
        pathParts[pathParts.length - 1] = newFileName
        const newObjectKey = pathParts.join('/')

        // Rename file trong MinIO
        const result = await this.minioService.renameFile(media.objectKey, newObjectKey)

        // Update database
        const updatedMedia = await this.mediaRepo.update(id, {
            objectKey: newObjectKey,
        })

        return {
            ...updatedMedia,
            url: result.url,
        }
    }

    /**
     * Lấy storage stats của user
     */
    async getStorageStats(userId: number): Promise<{
        totalFiles: number
        totalSize: bigint
        totalSizeFormatted: string
    }> {
        const totalFiles = await this.mediaRepo.countByUploader(userId)
        const totalSize = await this.mediaRepo.getTotalSizeByUploader(userId)

        // Format size
        const totalSizeFormatted = this.formatBytes(Number(totalSize))

        return {
            totalFiles,
            totalSize,
            totalSizeFormatted,
        }
    }

    /**
     * Search media theo mime type
     */
    async searchByMimeType(
        mimeType: string,
        options?: {
            skip?: number
            take?: number
        },
    ): Promise<Array<Media & { url: string }>> {
        const mediaList = await this.mediaRepo.findByMimeType(mimeType, options)

        return mediaList.map((media) => ({
            ...media,
            url: this.minioService.getPublicUrl(media.objectKey),
        }))
    }

    /**
     * Helper: Format bytes thành human-readable
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes'

        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    /**
     * Generate presigned download URL
     */
    async generateDownloadUrl(
        id: number,
        userId: number,
        userRole: string,
        expirySeconds: number = 3600,
    ): Promise<string> {
        const media = await this.sharedMediaRepo.findById(id)
        if (!media) {
            throw new NotFoundException('Media không tồn tại')
        }

        // Check permission
        if (media.visibility === 'private') {
            if (media.uploadedBy !== userId && userRole !== 'admin') {
                throw new ForbiddenException('Bạn không có quyền tải file này')
            }
        }

        return await this.minioService.generatePresignedDownloadUrl(media.objectKey, expirySeconds)
    }
}
