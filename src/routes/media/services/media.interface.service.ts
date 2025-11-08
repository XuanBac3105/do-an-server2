import { Media } from '@prisma/client'

export interface IMediaService {
    uploadFile(
        file: Express.Multer.File,
        uploaderId: number,
        visibility?: 'public' | 'private',
        metadata?: Record<string, string>,
    ): Promise<Media & { url: string }>

    uploadMultipleFiles(
        files: Express.Multer.File[],
        uploaderId: number,
        visibility?: 'public' | 'private',
    ): Promise<Array<Media & { url: string }>>

    getMediaById(id: number, includeRelations?: boolean): Promise<Media & { url: string }>

    getMediaByUser(
        uploaderId: number,
        options?: {
            skip?: number
            take?: number
            includeDeleted?: boolean
        },
    ): Promise<Array<Media & { url: string }>>

    downloadFile(
        id: number,
        userId: number,
        userRole: string,
    ): Promise<{
        stream: any
        filename: string
        mimeType: string
        size: number
    }>

    softDeleteMedia(id: number, userId: number, userRole: string): Promise<Media>

    hardDeleteMedia(id: number, userId: number, userRole: string): Promise<void>

    restoreMedia(id: number, userId: number, userRole: string): Promise<Media>

    updateVisibility(id: number, visibility: 'public' | 'private', userId: number, userRole: string): Promise<Media>

    renameFile(id: number, newFileName: string, userId: number, userRole: string): Promise<Media & { url: string }>

    getStorageStats(userId: number): Promise<{
        totalFiles: number
        totalSize: bigint
        totalSizeFormatted: string
    }>

    searchByMimeType(
        mimeType: string,
        options?: {
            skip?: number
            take?: number
        },
    ): Promise<Array<Media & { url: string }>>

    generateDownloadUrl(id: number, userId: number, userRole: string, expirySeconds?: number): Promise<string>
}
