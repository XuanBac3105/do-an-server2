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
    Inject,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import { UploadFileReqDto } from './dtos/requests/upload-file-req.dto'
import { UploadMultipleFilesReqDto } from './dtos/requests/upload-multiple-files-req.dto'
import { UpdateVisibilityReqDto } from './dtos/requests/update-visibility-req.dto'
import { RenameFileReqDto } from './dtos/requests/rename-file-req.dto'
import { MediaQueryDto } from './dtos/queries/media-query.dto'
import { MediaResDto } from './dtos/responses/media-res.dto'
import { UploadResDto } from './dtos/responses/upload-res.dto'
import { StorageStatsResDto } from './dtos/responses/storage-stats-res.dto'
import { CurrentUser } from 'src/shared/decorators/current-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { ResponseMessage } from 'src/shared/types/response-message.type'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { GetUserParamDto } from 'src/shared/dtos/get-user-param.dto'
import type { IMediaService } from './services/media.interface.service'

@Controller('media')
export class MediaController {
    constructor(@Inject('IMediaService') private readonly mediaService: IMediaService) {}

    /**
     * Upload single file
     */
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ZodSerializerDto(UploadResDto)
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UploadFileReqDto,
        @CurrentUser() user: GetUserParamDto,
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
        @CurrentUser() user: GetUserParamDto,
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
    async getMyMedia(@CurrentUser() user: GetUserParamDto, @Query() query: MediaQueryDto) {
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
    async getMyStats(@CurrentUser() user: GetUserParamDto) {
        return await this.mediaService.getStorageStats(user.id)
    }

    /**
     * Download file
     */
    @Get(':id/download')
    async downloadFile(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: GetUserParamDto,
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
        @CurrentUser() user: GetUserParamDto,
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
        @CurrentUser() user: GetUserParamDto,
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
        @CurrentUser() user: GetUserParamDto,
    ) {
        return await this.mediaService.renameFile(id, body.newFileName, user.id, user.role)
    }

    /**
     * Soft delete media
     */
    @Delete(':id')
    async softDeleteMedia(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: GetUserParamDto,
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
        @CurrentUser() user: GetUserParamDto,
    ): Promise<ResponseMessage> {
        await this.mediaService.hardDeleteMedia(id, user.id, user.role)
        return { message: 'Xóa vĩnh viễn file thành công' }
    }

    /**
     * Restore soft deleted media
     */
    @Put(':id/restore')
    @ZodSerializerDto(MediaResDto)
    async restoreMedia(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: GetUserParamDto) {
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
