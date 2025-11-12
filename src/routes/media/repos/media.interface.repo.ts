import { Media, Prisma } from '@prisma/client'

export interface IMediaRepo {
    create(data: Prisma.MediaCreateInput): Promise<Media>
    findByBucketAndKey(bucket: string, objectKey: string): Promise<Media | null>
    findByUploader(
        uploaderId: number,
        options?: {
            skip?: number
            take?: number
            includeDeleted?: boolean
        },
    ): Promise<Media[]>
    findByVisibility(
        visibility: string,
        options?: {
            skip?: number
            take?: number
        },
    ): Promise<Media[]>
    softDelete(id: number): Promise<Media>
    hardDelete(id: number): Promise<Media>
    restore(id: number): Promise<Media>
    update(id: number, data: Prisma.MediaUpdateInput): Promise<Media>
    countByUploader(uploaderId: number, includeDeleted?: boolean): Promise<number>
    getTotalSizeByUploader(uploaderId: number): Promise<bigint>
    findByMimeType(
        mimeType: string,
        options?: {
            skip?: number
            take?: number
        },
    ): Promise<Media[]>
    findDeleted(options?: { skip?: number; take?: number }): Promise<Media[]>
    createMany(data: Prisma.MediaCreateManyInput[]): Promise<Prisma.BatchPayload>
    deleteMany(ids: number[]): Promise<Prisma.BatchPayload>
    findByDisk(
        disk: string,
        options?: {
            skip?: number
            take?: number
        },
    ): Promise<Media[]>
    isMediaInUse(mediaId: number): Promise<boolean>
}
