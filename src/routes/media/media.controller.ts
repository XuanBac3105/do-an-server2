import {
    Controller,
    Post,
    Get,
    Delete,
    Put,
    Param,
    Query,
    Body,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
    ParseIntPipe,
    Res,
    StreamableFile,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { MediaService } from './media.service'
import {
    UploadFileReqDto,
    UploadMultipleFilesReqDto,
    UpdateVisibilityReqDto,
    MediaQueryDto,
    RenameFileReqDto,
    MediaResDto,
    UploadResDto,
    StorageStatsResDto,
} from './media.dto'
import { CurrentUser } from 'src/shared/decorators/current-use.decorator'
import { UserDecoratorParam } from '../profile/profile.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { Roles } from 'src/shared/decorators/roles.decorator'

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    /**
     * Upload single file
     */
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ZodSerializerDto(UploadResDto)
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UploadFileReqDto,
        @CurrentUser() user: UserDecoratorParam,
    ) {
        return await this.mediaService.uploadFile(file, user.id, body.visibility, body.metadata)
    }

    /**
     * Upload multiple files
     */
    @Post('upload-multiple')
    @UseInterceptors(FilesInterceptor('files', 10)) // max 10 files
    async uploadMultipleFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: UploadMultipleFilesReqDto,
        @CurrentUser() user: UserDecoratorParam,
    ) {
        return await this.mediaService.uploadMultipleFiles(files, user.id, body.visibility)
    }

    /**
     * Get media by ID
     */
    @Get(':id')
    @ZodSerializerDto(MediaResDto)
    async getMediaById(@Param('id', ParseIntPipe) id: number) {
        return await this.mediaService.getMediaById(id, true)
    }

    /**
     * Get my media
     */
    @Get('my/list')
    async getMyMedia(@CurrentUser() user: UserDecoratorParam, @Query() query: MediaQueryDto) {
        const skip = query.page && query.limit ? (query.page - 1) * query.limit : undefined
        const take = query.limit

        return await this.mediaService.getMediaByUser(user.id, {
            skip,
            take,
            includeDeleted: query.includeDeleted,
        })
    }

    /**
     * Get my storage stats
     */
    @Get('my/stats')
    @ZodSerializerDto(StorageStatsResDto)
    async getMyStats(@CurrentUser() user: UserDecoratorParam) {
        return await this.mediaService.getStorageStats(user.id)
    }

    /**
     * Download file
     */
    @Get(':id/download')
    async downloadFile(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: UserDecoratorParam,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { stream, filename, mimeType } = await this.mediaService.downloadFile(id, user.id, user.role)

        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${filename}"`,
        })

        return new StreamableFile(stream)
    }

    /**
     * Get presigned download URL
     */
    @Get(':id/download-url')
    async getDownloadUrl(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: UserDecoratorParam,
        @Query('expirySeconds') expirySeconds?: number,
    ) {
        const url = await this.mediaService.generateDownloadUrl(
            id,
            user.id,
            user.role,
            expirySeconds || 3600,
        )
        return { url }
    }

    /**
     * Update visibility
     */
    @Put(':id/visibility')
    @ZodSerializerDto(MediaResDto)
    async updateVisibility(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateVisibilityReqDto,
        @CurrentUser() user: UserDecoratorParam,
    ) {
        return await this.mediaService.updateVisibility(id, body.visibility, user.id, user.role)
    }

    /**
     * Rename file
     */
    @Put(':id/rename')
    @ZodSerializerDto(MediaResDto)
    async renameFile(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: RenameFileReqDto,
        @CurrentUser() user: UserDecoratorParam,
    ) {
        return await this.mediaService.renameFile(id, body.newFileName, user.id, user.role)
    }

    /**
     * Soft delete media
     */
    @Delete(':id')
    async softDeleteMedia(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: UserDecoratorParam,
    ): Promise<ResponseMessage> {
        await this.mediaService.softDeleteMedia(id, user.id, user.role)
        return { message: 'Xóa file thành công' }
    }

    /**
     * Hard delete media (permanently)
     */
    @Delete(':id/permanent')
    @Roles('admin')
    async hardDeleteMedia(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: UserDecoratorParam,
    ): Promise<ResponseMessage> {
        await this.mediaService.hardDeleteMedia(id, user.id, user.role)
        return { message: 'Xóa vĩnh viễn file thành công' }
    }

    /**
     * Restore soft deleted media
     */
    @Put(':id/restore')
    @ZodSerializerDto(MediaResDto)
    async restoreMedia(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserDecoratorParam) {
        return await this.mediaService.restoreMedia(id, user.id, user.role)
    }

    /**
     * Search by mime type
     */
    @Get('search/by-mime-type')
    async searchByMimeType(@Query('mimeType') mimeType: string, @Query() query: MediaQueryDto) {
        const skip = query.page && query.limit ? (query.page - 1) * query.limit : undefined
        const take = query.limit

        return await this.mediaService.searchByMimeType(mimeType, {
            skip,
            take,
        })
    }
}
