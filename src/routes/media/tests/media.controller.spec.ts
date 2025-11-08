import { Test, TestingModule } from '@nestjs/testing'
import { MediaController } from '../media.controller'
import { GetUserParamDto } from 'src/shared/dtos/get-user-param.dto'
import { UploadFileReqDto } from '../dtos/requests/upload-file-req.dto'
import { UploadMultipleFilesReqDto } from '../dtos/requests/upload-multiple-files-req.dto'
import { UpdateVisibilityReqDto } from '../dtos/requests/update-visibility-req.dto'
import { RenameFileReqDto } from '../dtos/requests/rename-file-req.dto'
import { MediaQueryDto } from '../dtos/queries/media-query.dto'
import { Response } from 'express'
import { StreamableFile } from '@nestjs/common'
import type { IMediaService } from '../services/media.interface.service'

describe('MediaController', () => {
    let controller: MediaController
    let service: IMediaService

    const mockMediaService = {
        uploadFile: jest.fn(),
        uploadMultipleFiles: jest.fn(),
        getMediaById: jest.fn(),
        getMediaByUser: jest.fn(),
        getStorageStats: jest.fn(),
        downloadFile: jest.fn(),
        generateDownloadUrl: jest.fn(),
        updateVisibility: jest.fn(),
        renameFile: jest.fn(),
        softDeleteMedia: jest.fn(),
        hardDeleteMedia: jest.fn(),
        restoreMedia: jest.fn(),
        searchByMimeType: jest.fn(),
    }

    const mockUser: GetUserParamDto = {
        id: 1,
        role: 'student',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '1234567890',
        avatarMediaId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test'),
        stream: {} as any,
        destination: '',
        filename: '',
        path: '',
    }

    const mockMedia = {
        id: 1,
        disk: 'minio',
        bucket: 'test-bucket',
        objectKey: 'test/file.pdf',
        mimeType: 'application/pdf',
        sizeBytes: BigInt(1024),
        visibility: 'private',
        uploadedBy: 1,
        createdAt: new Date(),
        deletedAt: null,
        url: 'https://example.com/file.pdf',
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MediaController],
            providers: [
                {
                    provide: 'IMediaService',
                    useValue: mockMediaService,
                },
            ],
        }).compile()

        controller = module.get<MediaController>(MediaController)
        service = module.get<IMediaService>('IMediaService')

        // Clear all mocks before each test
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('uploadFile', () => {
        it('should upload a file successfully', async () => {
            const uploadDto: UploadFileReqDto = {
                visibility: 'private',
                metadata: { description: 'Test file' },
            }

            mockMediaService.uploadFile.mockResolvedValue(mockMedia)

            const result = await controller.uploadFile(mockFile, uploadDto, mockUser)

            expect(result).toEqual(mockMedia)
            expect(mockMediaService.uploadFile).toHaveBeenCalledWith(
                mockFile,
                mockUser.id,
                uploadDto.visibility,
                uploadDto.metadata,
            )
        })
    })

    describe('uploadMultipleFiles', () => {
        it('should upload multiple files successfully', async () => {
            const files = [mockFile, mockFile]
            const uploadDto: UploadMultipleFilesReqDto = {
                visibility: 'public',
            }

            mockMediaService.uploadMultipleFiles.mockResolvedValue([mockMedia, mockMedia])

            const result = await controller.uploadMultipleFiles(files, uploadDto, mockUser)

            expect(result).toHaveLength(2)
            expect(mockMediaService.uploadMultipleFiles).toHaveBeenCalledWith(
                files,
                mockUser.id,
                uploadDto.visibility,
            )
        })
    })

    describe('getMediaById', () => {
        it('should get media by id', async () => {
            mockMediaService.getMediaById.mockResolvedValue(mockMedia)

            const result = await controller.getMediaById(1)

            expect(result).toEqual(mockMedia)
            expect(mockMediaService.getMediaById).toHaveBeenCalledWith(1, true)
        })
    })

    describe('getMyMedia', () => {
        it('should get my media list with pagination', async () => {
            const query: MediaQueryDto = {
                page: 1,
                limit: 20,
            }

            mockMediaService.getMediaByUser.mockResolvedValue([mockMedia])

            const result = await controller.getMyMedia(mockUser, query)

            expect(result).toEqual([mockMedia])
            expect(mockMediaService.getMediaByUser).toHaveBeenCalledWith(mockUser.id, {
                skip: 0,
                take: 20,
                includeDeleted: undefined,
            })
        })
    })

    describe('getMyStats', () => {
        it('should get storage statistics', async () => {
            const stats = {
                totalFiles: 10,
                totalSize: BigInt(10240),
                totalSizeFormatted: '10 KB',
            }

            mockMediaService.getStorageStats.mockResolvedValue(stats)

            const result = await controller.getMyStats(mockUser)

            expect(result).toEqual(stats)
            expect(mockMediaService.getStorageStats).toHaveBeenCalledWith(mockUser.id)
        })
    })

    describe('downloadFile', () => {
        it('should download a file', async () => {
            const mockStream = Buffer.from('test')
            const mockResponse = {
                set: jest.fn(),
            } as unknown as Response

            mockMediaService.downloadFile.mockResolvedValue({
                stream: mockStream,
                filename: 'test.pdf',
                mimeType: 'application/pdf',
                size: 1024,
            })

            const result = await controller.downloadFile(1, mockUser, mockResponse)

            expect(result).toBeInstanceOf(StreamableFile)
            expect(mockResponse.set).toHaveBeenCalledWith({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="test.pdf"',
            })
            expect(mockMediaService.downloadFile).toHaveBeenCalledWith(1, mockUser.id, mockUser.role)
        })
    })

    describe('getDownloadUrl', () => {
        it('should get presigned download URL', async () => {
            const url = 'https://example.com/presigned-url'
            mockMediaService.generateDownloadUrl.mockResolvedValue(url)

            const result = await controller.getDownloadUrl(1, mockUser, 3600)

            expect(result).toEqual({ url })
            expect(mockMediaService.generateDownloadUrl).toHaveBeenCalledWith(
                1,
                mockUser.id,
                mockUser.role,
                3600,
            )
        })
    })

    describe('updateVisibility', () => {
        it('should update visibility', async () => {
            const updateDto: UpdateVisibilityReqDto = {
                visibility: 'public',
            }

            mockMediaService.updateVisibility.mockResolvedValue({
                ...mockMedia,
                visibility: 'public',
            })

            const result = await controller.updateVisibility(1, updateDto, mockUser)

            expect(result.visibility).toBe('public')
            expect(mockMediaService.updateVisibility).toHaveBeenCalledWith(
                1,
                updateDto.visibility,
                mockUser.id,
                mockUser.role,
            )
        })
    })

    describe('renameFile', () => {
        it('should rename a file', async () => {
            const renameDto: RenameFileReqDto = {
                newFileName: 'new-name.pdf',
            }

            mockMediaService.renameFile.mockResolvedValue({
                ...mockMedia,
                objectKey: 'test/new-name.pdf',
            })

            const result = await controller.renameFile(1, renameDto, mockUser)

            expect(result.objectKey).toBe('test/new-name.pdf')
            expect(mockMediaService.renameFile).toHaveBeenCalledWith(
                1,
                renameDto.newFileName,
                mockUser.id,
                mockUser.role,
            )
        })
    })

    describe('softDeleteMedia', () => {
        it('should soft delete media', async () => {
            mockMediaService.softDeleteMedia.mockResolvedValue(mockMedia)

            const result = await controller.softDeleteMedia(1, mockUser)

            expect(result).toEqual({ message: 'Xóa file thành công' })
            expect(mockMediaService.softDeleteMedia).toHaveBeenCalledWith(1, mockUser.id, mockUser.role)
        })
    })

    describe('hardDeleteMedia', () => {
        it('should hard delete media permanently', async () => {
            mockMediaService.hardDeleteMedia.mockResolvedValue(undefined)

            const result = await controller.hardDeleteMedia(1, mockUser)

            expect(result).toEqual({ message: 'Xóa vĩnh viễn file thành công' })
            expect(mockMediaService.hardDeleteMedia).toHaveBeenCalledWith(1, mockUser.id, mockUser.role)
        })
    })

    describe('restoreMedia', () => {
        it('should restore soft deleted media', async () => {
            mockMediaService.restoreMedia.mockResolvedValue(mockMedia)

            const result = await controller.restoreMedia(1, mockUser)

            expect(result).toEqual(mockMedia)
            expect(mockMediaService.restoreMedia).toHaveBeenCalledWith(1, mockUser.id, mockUser.role)
        })
    })

    describe('searchByMimeType', () => {
        it('should search media by mime type', async () => {
            const query: MediaQueryDto = {
                page: 1,
                limit: 20,
            }

            mockMediaService.searchByMimeType.mockResolvedValue([mockMedia])

            const result = await controller.searchByMimeType('application/pdf', query)

            expect(result).toEqual([mockMedia])
            expect(mockMediaService.searchByMimeType).toHaveBeenCalledWith('application/pdf', {
                skip: 0,
                take: 20,
            })
        })
    })
})
