import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common'
import * as Minio from 'minio'
import { envConfig } from '../config'
import { v4 as uuidv4 } from 'uuid'
import { Readable } from 'stream'
import { UploadFileOptions, UploadResult } from '../types/upload.type'

@Injectable()
export class MinioService implements OnModuleInit {
    private readonly logger = new Logger(MinioService.name)
    private readonly minioClient: Minio.Client
    private readonly bucketName: string

    constructor() {
        this.bucketName = envConfig.MINIO_BUCKET_NAME

        this.minioClient = new Minio.Client({
            endPoint: envConfig.MINIO_ENDPOINT,
            port: envConfig.MINIO_PORT,
            useSSL: envConfig.MINIO_USE_SSL,
            accessKey: envConfig.MINIO_ACCESS_KEY,
            secretKey: envConfig.MINIO_SECRET_KEY,
        })

        this.logger.log('MinIO client initialized')
    }

    async onModuleInit() {
        await this.ensureBucketExists()
    }

    /**
     * Đảm bảo bucket tồn tại, nếu không thì tạo mới
     */
    private async ensureBucketExists(): Promise<void> {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName)
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1')
                this.logger.log(`Bucket "${this.bucketName}" created successfully`)

                // Set policy public read cho bucket (optional)
                const policy = {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Effect: 'Allow',
                            Principal: { AWS: ['*'] },
                            Action: ['s3:GetObject'],
                            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                        },
                    ],
                }
                await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy))
                this.logger.log(`Bucket "${this.bucketName}" policy set to public read`)
            } else {
                this.logger.log(`Bucket "${this.bucketName}" already exists`)
            }
        } catch (error) {
            this.logger.error(`Error ensuring bucket exists: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to initialize MinIO bucket')
        }
    }

    /**
     * Upload file lên MinIO
     * @param options - Upload options
     * @returns Upload result với objectKey và URL
     */
    async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
        try {
            const { file, fileName, mimeType, metadata = {} } = options

            // Tạo unique object key với UUID
            const fileExtension = fileName.split('.').pop()
            const uniqueFileName = `${uuidv4()}.${fileExtension}`
            const objectKey = `uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${uniqueFileName}`

            // Metadata cho object
            const metaData: Record<string, string> = {
                'Content-Type': mimeType || 'application/octet-stream',
                'X-Original-Filename': fileName,
                ...metadata,
            }

            // Upload file
            let etag: string | undefined
            if (Buffer.isBuffer(file)) {
                const uploadInfo = await this.minioClient.putObject(
                    this.bucketName,
                    objectKey,
                    file,
                    file.length,
                    metaData,
                )
                etag = uploadInfo.etag
            } else {
                // For stream, we don't pass metadata as a separate parameter
                const uploadInfo = await this.minioClient.putObject(
                    this.bucketName,
                    objectKey,
                    file,
                )
                etag = uploadInfo.etag
            }

            // Tạo URL public
            const url = this.getPublicUrl(objectKey)

            this.logger.log(`File uploaded successfully: ${objectKey}`)

            return {
                objectKey,
                bucket: this.bucketName,
                url,
                etag,
            }
        } catch (error) {
            this.logger.error(`Error uploading file: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to upload file to MinIO')
        }
    }

    /**
     * Upload nhiều files cùng lúc
     * @param files - Array of upload options
     * @returns Array of upload results
     */
    async uploadMultipleFiles(files: UploadFileOptions[]): Promise<UploadResult[]> {
        try {
            const uploadPromises = files.map((file) => this.uploadFile(file))
            return await Promise.all(uploadPromises)
        } catch (error) {
            this.logger.error(`Error uploading multiple files: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to upload multiple files')
        }
    }

    /**
     * Download file từ MinIO
     * @param objectKey - Object key của file
     * @returns Stream của file
     */
    async downloadFile(objectKey: string): Promise<Readable> {
        try {
            const stream = await this.minioClient.getObject(this.bucketName, objectKey)
            this.logger.log(`File downloaded successfully: ${objectKey}`)
            return stream
        } catch (error) {
            this.logger.error(`Error downloading file: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to download file from MinIO')
        }
    }

    /**
     * Lấy thông tin metadata của file
     * @param objectKey - Object key của file
     * @returns Stat info của file
     */
    async getFileStat(objectKey: string): Promise<Minio.BucketItemStat> {
        try {
            const stat = await this.minioClient.statObject(this.bucketName, objectKey)
            return stat
        } catch (error) {
            this.logger.error(`Error getting file stat: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to get file information')
        }
    }

    /**
     * Xóa file khỏi MinIO
     * @param objectKey - Object key của file
     */
    async deleteFile(objectKey: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, objectKey)
            this.logger.log(`File deleted successfully: ${objectKey}`)
        } catch (error) {
            this.logger.error(`Error deleting file: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to delete file from MinIO')
        }
    }

    /**
     * Xóa nhiều files cùng lúc
     * @param objectKeys - Array of object keys
     */
    async deleteMultipleFiles(objectKeys: string[]): Promise<void> {
        try {
            await this.minioClient.removeObjects(this.bucketName, objectKeys)
            this.logger.log(`Multiple files deleted successfully: ${objectKeys.length} files`)
        } catch (error) {
            this.logger.error(`Error deleting multiple files: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to delete multiple files')
        }
    }

    /**
     * Tạo presigned URL để upload trực tiếp từ client
     * @param objectKey - Object key cho file
     * @param expirySeconds - Thời gian hết hạn (mặc định 1 giờ)
     * @returns Presigned URL
     */
    async generatePresignedUploadUrl(objectKey: string, expirySeconds: number = 3600): Promise<string> {
        try {
            const url = await this.minioClient.presignedPutObject(this.bucketName, objectKey, expirySeconds)
            this.logger.log(`Presigned upload URL generated for: ${objectKey}`)
            return url
        } catch (error) {
            this.logger.error(`Error generating presigned URL: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to generate presigned URL')
        }
    }

    /**
     * Tạo presigned URL để download trực tiếp từ client
     * @param objectKey - Object key của file
     * @param expirySeconds - Thời gian hết hạn (mặc định 1 giờ)
     * @returns Presigned URL
     */
    async generatePresignedDownloadUrl(objectKey: string, expirySeconds: number = 3600): Promise<string> {
        try {
            const url = await this.minioClient.presignedGetObject(this.bucketName, objectKey, expirySeconds)
            this.logger.log(`Presigned download URL generated for: ${objectKey}`)
            return url
        } catch (error) {
            this.logger.error(`Error generating presigned download URL: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to generate presigned download URL')
        }
    }

    /**
     * List tất cả files trong một prefix (folder)
     * @param prefix - Prefix để filter (e.g., "uploads/2024/")
     * @returns Array of object info
     */
    async listFiles(prefix: string = ''): Promise<Minio.BucketItem[]> {
        try {
            const objectsList: Minio.BucketItem[] = []
            const stream = this.minioClient.listObjects(this.bucketName, prefix, true)

            return new Promise((resolve, reject) => {
                stream.on('data', (obj) => {
                    if (obj.name) {
                        objectsList.push(obj as Minio.BucketItem)
                    }
                })
                stream.on('end', () => {
                    this.logger.log(`Listed ${objectsList.length} files with prefix: ${prefix}`)
                    resolve(objectsList)
                })
                stream.on('error', (err) => reject(err))
            })
        } catch (error) {
            this.logger.error(`Error listing files: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to list files')
        }
    }

    /**
     * Kiểm tra xem file có tồn tại không
     * @param objectKey - Object key của file
     * @returns true nếu file tồn tại
     */
    async fileExists(objectKey: string): Promise<boolean> {
        try {
            await this.minioClient.statObject(this.bucketName, objectKey)
            return true
        } catch (error) {
            if (error.code === 'NotFound') {
                return false
            }
            throw error
        }
    }

    /**
     * Copy file trong MinIO
     * @param sourceKey - Source object key
     * @param destKey - Destination object key
     */
    async copyFile(sourceKey: string, destKey: string): Promise<void> {
        try {
            const conds = new Minio.CopyConditions()
            await this.minioClient.copyObject(
                this.bucketName,
                destKey,
                `/${this.bucketName}/${sourceKey}`,
                conds,
            )
            this.logger.log(`File copied from ${sourceKey} to ${destKey}`)
        } catch (error) {
            this.logger.error(`Error copying file: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to copy file')
        }
    }

    /**
     * Đổi tên file trong MinIO (move/rename)
     * @param oldKey - Object key hiện tại
     * @param newKey - Object key mới
     * @param preserveMetadata - Có giữ lại metadata không (mặc định true)
     */
    async renameFile(oldKey: string, newKey: string, preserveMetadata: boolean = true): Promise<UploadResult> {
        try {
            // Kiểm tra file cũ có tồn tại không
            const exists = await this.fileExists(oldKey)
            if (!exists) {
                throw new InternalServerErrorException(`File not found: ${oldKey}`)
            }

            // Kiểm tra file mới đã tồn tại chưa
            const newExists = await this.fileExists(newKey)
            if (newExists) {
                throw new InternalServerErrorException(`Destination file already exists: ${newKey}`)
            }

            // Copy file sang tên mới
            if (preserveMetadata) {
                const conds = new Minio.CopyConditions()
                await this.minioClient.copyObject(
                    this.bucketName,
                    newKey,
                    `/${this.bucketName}/${oldKey}`,
                    conds,
                )
            } else {
                // Nếu không giữ metadata, download rồi upload lại
                const stream = await this.downloadFile(oldKey)
                const chunks: Buffer[] = []
                
                await new Promise<void>((resolve, reject) => {
                    stream.on('data', (chunk) => chunks.push(chunk))
                    stream.on('end', () => resolve())
                    stream.on('error', (err) => reject(err))
                })

                const buffer = Buffer.concat(chunks)
                await this.minioClient.putObject(this.bucketName, newKey, buffer)
            }

            // Xóa file cũ
            await this.deleteFile(oldKey)

            // Lấy thông tin file mới
            const stat = await this.getFileStat(newKey)
            const url = this.getPublicUrl(newKey)

            this.logger.log(`File renamed from ${oldKey} to ${newKey}`)

            return {
                objectKey: newKey,
                bucket: this.bucketName,
                url,
                etag: stat.etag,
            }
        } catch (error) {
            this.logger.error(`Error renaming file: ${error.message}`, error.stack)
            if (error instanceof InternalServerErrorException) {
                throw error
            }
            throw new InternalServerErrorException('Failed to rename file')
        }
    }

    /**
     * Di chuyển file sang folder khác (giữ nguyên tên file)
     * @param sourceKey - Object key hiện tại
     * @param destinationPrefix - Prefix/folder đích (e.g., "uploads/2024/11/")
     * @returns Upload result với objectKey và URL mới
     */
    async moveFile(sourceKey: string, destinationPrefix: string): Promise<UploadResult> {
        try {
            // Lấy tên file từ sourceKey
            const fileName = sourceKey.split('/').pop()
            if (!fileName) {
                throw new InternalServerErrorException('Invalid source key')
            }

            // Tạo destination key
            const destKey = `${destinationPrefix.endsWith('/') ? destinationPrefix : destinationPrefix + '/'}${fileName}`

            // Sử dụng rename để di chuyển
            return await this.renameFile(sourceKey, destKey, true)
        } catch (error) {
            this.logger.error(`Error moving file: ${error.message}`, error.stack)
            throw new InternalServerErrorException('Failed to move file')
        }
    }

    /**
     * Lấy public URL của file
     * @param objectKey - Object key của file
     * @returns Public URL
     */
    getPublicUrl(objectKey: string): string {
        const protocol = envConfig.MINIO_USE_SSL ? 'https' : 'http'
        const port = envConfig.MINIO_PORT === 443 || envConfig.MINIO_PORT === 80 ? '' : `:${envConfig.MINIO_PORT}`
        return `${protocol}://${envConfig.MINIO_ENDPOINT}${port}/${this.bucketName}/${objectKey}`
    }

    /**
     * Lấy MinIO client instance (cho advanced usage)
     */
    getClient(): Minio.Client {
        return this.minioClient
    }
}
