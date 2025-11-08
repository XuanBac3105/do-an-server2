import { Test, TestingModule } from '@nestjs/testing'
import { MediaService } from '../services/media.service'
import { MinioService } from 'src/shared/services/minio.service'
import type { IMediaRepo } from '../repos/media.interface.repo'
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { Media } from '@prisma/client'
import { Readable } from 'stream'

describe('MediaService', () => {
    let service: MediaService
    let repo: IMediaRepo
    let minioService: MinioService

    const mockMedia: Media = {
        id: 1,
        disk: 'minio',
        bucket: 'test-bucket',
        objectKey: 'uploads/test-file.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: BigInt(1024),
        visibility: 'private',
        uploadedBy: 1,
        createdAt: new Date(),
        deletedAt: null,
    }

    const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-file.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MediaService,
                {
                    provide: 'IMediaRepo',
                    useValue: {
                        create: jest.fn(),
                        findById: jest.fn(),
                        findByUploader: jest.fn(),
                        softDelete: jest.fn(),
                        hardDelete: jest.fn(),
                        restore: jest.fn(),
                        update: jest.fn(),
                        countByUploader: jest.fn(),
                        getTotalSizeByUploader: jest.fn(),
                        isMediaInUse: jest.fn(),
                        findByMimeType: jest.fn(),
                    },
                },
                {
                    provide: MinioService,
                    useValue: {
                        uploadFile: jest.fn(),
                        downloadFile: jest.fn(),
                        deleteFile: jest.fn(),
                        getPublicUrl: jest.fn(),
                        getFileStat: jest.fn(),
                        renameFile: jest.fn(),
                        generatePresignedDownloadUrl: jest.fn(),
                    },
                },
            ],
        }).compile()

        service = module.get<MediaService>(MediaService)
        repo = module.get<IMediaRepo>('IMediaRepo')
        minioService = module.get<MinioService>(MinioService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('uploadFile', () => {
        it('should upload file successfully', async () => {
            const uploadResult = {
                bucket: 'test-bucket',
                objectKey: 'uploads/test-file.jpg',
                url: 'http://minio.com/test-bucket/uploads/test-file.jpg',
            }

            jest.spyOn(minioService, 'uploadFile').mockResolvedValue(uploadResult)
            jest.spyOn(repo, 'create').mockResolvedValue(mockMedia)

            const result = await service.uploadFile(mockFile, 1, 'private')

            expect(minioService.uploadFile).toHaveBeenCalledWith({
                file: mockFile.buffer,
                fileName: mockFile.originalname,
                mimeType: mockFile.mimetype,
                metadata: undefined,
            })
            expect(repo.create).toHaveBeenCalled()
            expect(result).toEqual({
                ...mockMedia,
                url: uploadResult.url,
            })
        })

        it('should upload file with custom metadata', async () => {
            const uploadResult = {
                bucket: 'test-bucket',
                objectKey: 'uploads/test-file.jpg',
                url: 'http://minio.com/test-bucket/uploads/test-file.jpg',
            }
            const metadata = { customKey: 'customValue' }

            jest.spyOn(minioService, 'uploadFile').mockResolvedValue(uploadResult)
            jest.spyOn(repo, 'create').mockResolvedValue(mockMedia)

            await service.uploadFile(mockFile, 1, 'public', metadata)

            expect(minioService.uploadFile).toHaveBeenCalledWith({
                file: mockFile.buffer,
                fileName: mockFile.originalname,
                mimeType: mockFile.mimetype,
                metadata,
            })
        })
    })

    describe('uploadMultipleFiles', () => {
        it('should upload multiple files successfully', async () => {
            const uploadResult = {
                bucket: 'test-bucket',
                objectKey: 'uploads/test-file.jpg',
                url: 'http://minio.com/test-bucket/uploads/test-file.jpg',
            }

            jest.spyOn(minioService, 'uploadFile').mockResolvedValue(uploadResult)
            jest.spyOn(repo, 'create').mockResolvedValue(mockMedia)

            const files = [mockFile, mockFile]
            const result = await service.uploadMultipleFiles(files, 1, 'private')

            expect(result).toHaveLength(2)
            expect(minioService.uploadFile).toHaveBeenCalledTimes(2)
        })
    })

    describe('getMediaById', () => {
        it('should get media by id successfully', async () => {
            const url = 'http://minio.com/test-bucket/uploads/test-file.jpg'
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(minioService, 'getPublicUrl').mockReturnValue(url)

            const result = await service.getMediaById(1)

            expect(repo.findById).toHaveBeenCalledWith(1, false)
            expect(result).toEqual({
                ...mockMedia,
                url,
            })
        })

        it('should throw NotFoundException when media not found', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(null)

            await expect(service.getMediaById(999)).rejects.toThrow(NotFoundException)
        })

        it('should get media with relations', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(minioService, 'getPublicUrl').mockReturnValue('url')

            await service.getMediaById(1, true)

            expect(repo.findById).toHaveBeenCalledWith(1, true)
        })
    })

    describe('getMediaByUser', () => {
        it('should get media list by user', async () => {
            const mediaList = [mockMedia, { ...mockMedia, id: 2 }]
            jest.spyOn(repo, 'findByUploader').mockResolvedValue(mediaList)
            jest.spyOn(minioService, 'getPublicUrl').mockReturnValue('url')

            const result = await service.getMediaByUser(1)

            expect(result).toHaveLength(2)
            expect(repo.findByUploader).toHaveBeenCalledWith(1, undefined)
        })

        it('should get media list with pagination', async () => {
            jest.spyOn(repo, 'findByUploader').mockResolvedValue([mockMedia])
            jest.spyOn(minioService, 'getPublicUrl').mockReturnValue('url')

            const options = { skip: 0, take: 10 }
            await service.getMediaByUser(1, options)

            expect(repo.findByUploader).toHaveBeenCalledWith(1, options)
        })
    })

    describe('downloadFile', () => {
        it('should download public file successfully', async () => {
            const publicMedia = { ...mockMedia, visibility: 'public' as const }
            const stream = new Readable()
            const stat = { 
                size: 1024, 
                etag: 'test-etag', 
                lastModified: new Date(),
                metaData: {}
            }

            jest.spyOn(repo, 'findById').mockResolvedValue(publicMedia)
            jest.spyOn(minioService, 'downloadFile').mockResolvedValue(stream)
            jest.spyOn(minioService, 'getFileStat').mockResolvedValue(stat as any)

            const result = await service.downloadFile(1, 2, 'student')

            expect(result.stream).toBe(stream)
            expect(result.size).toBe(1024)
        })

        it('should download private file by owner', async () => {
            const stream = new Readable()
            const stat = { 
                size: 1024, 
                etag: 'test-etag', 
                lastModified: new Date(),
                metaData: {}
            }

            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(minioService, 'downloadFile').mockResolvedValue(stream)
            jest.spyOn(minioService, 'getFileStat').mockResolvedValue(stat as any)

            const result = await service.downloadFile(1, 1, 'student')

            expect(result).toBeDefined()
        })

        it('should download private file by admin', async () => {
            const stream = new Readable()
            const stat = { 
                size: 1024, 
                etag: 'test-etag', 
                lastModified: new Date(),
                metaData: {}
            }

            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(minioService, 'downloadFile').mockResolvedValue(stream)
            jest.spyOn(minioService, 'getFileStat').mockResolvedValue(stat as any)

            const result = await service.downloadFile(1, 2, 'admin')

            expect(result).toBeDefined()
        })

        it('should throw NotFoundException when media not found', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(null)

            await expect(service.downloadFile(999, 1, 'student')).rejects.toThrow(NotFoundException)
        })

        it('should throw ForbiddenException when user has no permission', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)

            await expect(service.downloadFile(1, 2, 'student')).rejects.toThrow(ForbiddenException)
        })
    })

    describe('softDeleteMedia', () => {
        it('should soft delete media successfully', async () => {
            const deletedMedia = { ...mockMedia, deletedAt: new Date() }
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(repo, 'isMediaInUse').mockResolvedValue(false)
            jest.spyOn(repo, 'softDelete').mockResolvedValue(deletedMedia)

            const result = await service.softDeleteMedia(1, 1, 'student')

            expect(result.deletedAt).toBeDefined()
            expect(repo.softDelete).toHaveBeenCalledWith(1)
        })

        it('should allow admin to delete any media', async () => {
            const deletedMedia = { ...mockMedia, deletedAt: new Date() }
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(repo, 'isMediaInUse').mockResolvedValue(false)
            jest.spyOn(repo, 'softDelete').mockResolvedValue(deletedMedia)

            await service.softDeleteMedia(1, 2, 'admin')

            expect(repo.softDelete).toHaveBeenCalled()
        })

        it('should throw NotFoundException when media not found', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(null)

            await expect(service.softDeleteMedia(999, 1, 'student')).rejects.toThrow(NotFoundException)
        })

        it('should throw ForbiddenException when user has no permission', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)

            await expect(service.softDeleteMedia(1, 2, 'student')).rejects.toThrow(ForbiddenException)
        })

        it('should throw BadRequestException when media is in use', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(repo, 'isMediaInUse').mockResolvedValue(true)

            await expect(service.softDeleteMedia(1, 1, 'student')).rejects.toThrow(BadRequestException)
        })
    })

    describe('hardDeleteMedia', () => {
        it('should hard delete media successfully', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(repo, 'isMediaInUse').mockResolvedValue(false)
            jest.spyOn(minioService, 'deleteFile').mockResolvedValue(undefined)
            jest.spyOn(repo, 'hardDelete').mockResolvedValue(mockMedia)

            await service.hardDeleteMedia(1, 1, 'student')

            expect(minioService.deleteFile).toHaveBeenCalledWith(mockMedia.objectKey)
            expect(repo.hardDelete).toHaveBeenCalledWith(1)
        })

        it('should allow admin to hard delete any media', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(repo, 'isMediaInUse').mockResolvedValue(false)
            jest.spyOn(minioService, 'deleteFile').mockResolvedValue(undefined)
            jest.spyOn(repo, 'hardDelete').mockResolvedValue(mockMedia)

            await service.hardDeleteMedia(1, 2, 'admin')

            expect(repo.hardDelete).toHaveBeenCalled()
        })

        it('should throw NotFoundException when media not found', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(null)

            await expect(service.hardDeleteMedia(999, 1, 'student')).rejects.toThrow(NotFoundException)
        })

        it('should throw ForbiddenException when user has no permission', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)

            await expect(service.hardDeleteMedia(1, 2, 'student')).rejects.toThrow(ForbiddenException)
        })

        it('should throw BadRequestException when media is in use', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(repo, 'isMediaInUse').mockResolvedValue(true)

            await expect(service.hardDeleteMedia(1, 1, 'student')).rejects.toThrow(BadRequestException)
        })
    })

    describe('restoreMedia', () => {
        it('should restore media successfully', async () => {
            const deletedMedia = { ...mockMedia, deletedAt: new Date() }
            const restoredMedia = { ...mockMedia, deletedAt: null }
            jest.spyOn(repo, 'findById').mockResolvedValue(deletedMedia)
            jest.spyOn(repo, 'restore').mockResolvedValue(restoredMedia)

            const result = await service.restoreMedia(1, 1, 'student')

            expect(result.deletedAt).toBeNull()
            expect(repo.restore).toHaveBeenCalledWith(1)
        })

        it('should allow admin to restore any media', async () => {
            const deletedMedia = { ...mockMedia, deletedAt: new Date() }
            const restoredMedia = { ...mockMedia, deletedAt: null }
            jest.spyOn(repo, 'findById').mockResolvedValue(deletedMedia)
            jest.spyOn(repo, 'restore').mockResolvedValue(restoredMedia)

            await service.restoreMedia(1, 2, 'admin')

            expect(repo.restore).toHaveBeenCalled()
        })

        it('should throw NotFoundException when media not found', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(null)

            await expect(service.restoreMedia(999, 1, 'student')).rejects.toThrow(NotFoundException)
        })

        it('should throw ForbiddenException when user has no permission', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)

            await expect(service.restoreMedia(1, 2, 'student')).rejects.toThrow(ForbiddenException)
        })
    })

    describe('updateVisibility', () => {
        it('should update visibility to public successfully', async () => {
            const updatedMedia = { ...mockMedia, visibility: 'public' as const }
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(repo, 'update').mockResolvedValue(updatedMedia)

            const result = await service.updateVisibility(1, 'public', 1, 'student')

            expect(result.visibility).toBe('public')
            expect(repo.update).toHaveBeenCalledWith(1, { visibility: 'public' })
        })

        it('should update visibility to private successfully', async () => {
            const publicMedia = { ...mockMedia, visibility: 'public' as const }
            jest.spyOn(repo, 'findById').mockResolvedValue(publicMedia)
            jest.spyOn(repo, 'update').mockResolvedValue(mockMedia)

            const result = await service.updateVisibility(1, 'private', 1, 'student')

            expect(result.visibility).toBe('private')
        })

        it('should allow admin to update visibility', async () => {
            const updatedMedia = { ...mockMedia, visibility: 'public' as const }
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(repo, 'update').mockResolvedValue(updatedMedia)

            await service.updateVisibility(1, 'public', 2, 'admin')

            expect(repo.update).toHaveBeenCalled()
        })

        it('should throw NotFoundException when media not found', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(null)

            await expect(service.updateVisibility(999, 'public', 1, 'student')).rejects.toThrow(NotFoundException)
        })

        it('should throw ForbiddenException when user has no permission', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)

            await expect(service.updateVisibility(1, 'public', 2, 'student')).rejects.toThrow(ForbiddenException)
        })
    })

    describe('renameFile', () => {
        it('should rename file successfully', async () => {
            const newFileName = 'new-name.jpg'
            const newObjectKey = 'uploads/new-name.jpg'
            const updatedMedia = { ...mockMedia, objectKey: newObjectKey }
            const renameResult = {
                bucket: 'test-bucket',
                objectKey: newObjectKey,
                url: 'http://minio.com/test-bucket/uploads/new-name.jpg',
            }

            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(minioService, 'renameFile').mockResolvedValue(renameResult)
            jest.spyOn(repo, 'update').mockResolvedValue(updatedMedia)

            const result = await service.renameFile(1, newFileName, 1, 'student')

            expect(minioService.renameFile).toHaveBeenCalledWith(mockMedia.objectKey, newObjectKey)
            expect(result.objectKey).toBe(newObjectKey)
        })

        it('should allow admin to rename any file', async () => {
            const newFileName = 'new-name.jpg'
            const newObjectKey = 'uploads/new-name.jpg'
            const updatedMedia = { ...mockMedia, objectKey: newObjectKey }
            const renameResult = {
                bucket: 'test-bucket',
                objectKey: newObjectKey,
                url: 'http://minio.com/test-bucket/uploads/new-name.jpg',
            }

            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(minioService, 'renameFile').mockResolvedValue(renameResult)
            jest.spyOn(repo, 'update').mockResolvedValue(updatedMedia)

            await service.renameFile(1, newFileName, 2, 'admin')

            expect(repo.update).toHaveBeenCalled()
        })

        it('should throw NotFoundException when media not found', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(null)

            await expect(service.renameFile(999, 'new-name.jpg', 1, 'student')).rejects.toThrow(NotFoundException)
        })

        it('should throw ForbiddenException when user has no permission', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)

            await expect(service.renameFile(1, 'new-name.jpg', 2, 'student')).rejects.toThrow(ForbiddenException)
        })
    })

    describe('getStorageStats', () => {
        it('should get storage stats successfully', async () => {
            jest.spyOn(repo, 'countByUploader').mockResolvedValue(5)
            jest.spyOn(repo, 'getTotalSizeByUploader').mockResolvedValue(BigInt(1048576)) // 1 MB

            const result = await service.getStorageStats(1)

            expect(result.totalFiles).toBe(5)
            expect(result.totalSize).toBe(BigInt(1048576))
            expect(result.totalSizeFormatted).toBe('1 MB')
        })

        it('should format bytes correctly - 0 bytes', async () => {
            jest.spyOn(repo, 'countByUploader').mockResolvedValue(0)
            jest.spyOn(repo, 'getTotalSizeByUploader').mockResolvedValue(BigInt(0))

            const result = await service.getStorageStats(1)

            expect(result.totalSizeFormatted).toBe('0 Bytes')
        })

        it('should format bytes correctly - KB', async () => {
            jest.spyOn(repo, 'countByUploader').mockResolvedValue(1)
            jest.spyOn(repo, 'getTotalSizeByUploader').mockResolvedValue(BigInt(2048)) // 2 KB

            const result = await service.getStorageStats(1)

            expect(result.totalSizeFormatted).toBe('2 KB')
        })

        it('should format bytes correctly - GB', async () => {
            jest.spyOn(repo, 'countByUploader').mockResolvedValue(10)
            jest.spyOn(repo, 'getTotalSizeByUploader').mockResolvedValue(BigInt(2147483648)) // 2 GB

            const result = await service.getStorageStats(1)

            expect(result.totalSizeFormatted).toBe('2 GB')
        })
    })

    describe('searchByMimeType', () => {
        it('should search media by mime type successfully', async () => {
            const mediaList = [mockMedia, { ...mockMedia, id: 2 }]
            jest.spyOn(repo, 'findByMimeType').mockResolvedValue(mediaList)
            jest.spyOn(minioService, 'getPublicUrl').mockReturnValue('url')

            const result = await service.searchByMimeType('image/jpeg')

            expect(result).toHaveLength(2)
            expect(repo.findByMimeType).toHaveBeenCalledWith('image/jpeg', undefined)
        })

        it('should search with pagination', async () => {
            jest.spyOn(repo, 'findByMimeType').mockResolvedValue([mockMedia])
            jest.spyOn(minioService, 'getPublicUrl').mockReturnValue('url')

            const options = { skip: 0, take: 10 }
            await service.searchByMimeType('image/jpeg', options)

            expect(repo.findByMimeType).toHaveBeenCalledWith('image/jpeg', options)
        })
    })

    describe('generateDownloadUrl', () => {
        it('should generate download url for public media', async () => {
            const publicMedia = { ...mockMedia, visibility: 'public' as const }
            const presignedUrl = 'http://minio.com/presigned-url'

            jest.spyOn(repo, 'findById').mockResolvedValue(publicMedia)
            jest.spyOn(minioService, 'generatePresignedDownloadUrl').mockResolvedValue(presignedUrl)

            const result = await service.generateDownloadUrl(1, 2, 'student')

            expect(result).toBe(presignedUrl)
            expect(minioService.generatePresignedDownloadUrl).toHaveBeenCalledWith(mockMedia.objectKey, 3600)
        })

        it('should generate download url for private media by owner', async () => {
            const presignedUrl = 'http://minio.com/presigned-url'

            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(minioService, 'generatePresignedDownloadUrl').mockResolvedValue(presignedUrl)

            const result = await service.generateDownloadUrl(1, 1, 'student')

            expect(result).toBe(presignedUrl)
        })

        it('should generate download url for private media by admin', async () => {
            const presignedUrl = 'http://minio.com/presigned-url'

            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)
            jest.spyOn(minioService, 'generatePresignedDownloadUrl').mockResolvedValue(presignedUrl)

            const result = await service.generateDownloadUrl(1, 2, 'admin')

            expect(result).toBe(presignedUrl)
        })

        it('should generate download url with custom expiry', async () => {
            const publicMedia = { ...mockMedia, visibility: 'public' as const }
            const presignedUrl = 'http://minio.com/presigned-url'

            jest.spyOn(repo, 'findById').mockResolvedValue(publicMedia)
            jest.spyOn(minioService, 'generatePresignedDownloadUrl').mockResolvedValue(presignedUrl)

            await service.generateDownloadUrl(1, 1, 'student', 7200)

            expect(minioService.generatePresignedDownloadUrl).toHaveBeenCalledWith(mockMedia.objectKey, 7200)
        })

        it('should throw NotFoundException when media not found', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(null)

            await expect(service.generateDownloadUrl(999, 1, 'student')).rejects.toThrow(NotFoundException)
        })

        it('should throw ForbiddenException when user has no permission for private media', async () => {
            jest.spyOn(repo, 'findById').mockResolvedValue(mockMedia)

            await expect(service.generateDownloadUrl(1, 2, 'student')).rejects.toThrow(ForbiddenException)
        })
    })
})
