import { Test, TestingModule } from '@nestjs/testing'
import { MediaService } from '../services/media.service'
import { MinioService } from 'src/shared/services/minio.service'
import type { IMediaRepo } from '../repos/media.interface.repo'

describe('MediaService', () => {
    let service: MediaService
    let repo: IMediaRepo
    let minioService: MinioService

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

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    // Add more tests here
})
