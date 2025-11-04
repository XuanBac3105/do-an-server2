import { Readable } from 'stream'

export interface UploadFileOptions {
    file: Buffer | Readable
    fileName: string
    mimeType?: string
    metadata?: Record<string, string>
}

export interface UploadResult {
    objectKey: string
    bucket: string
    url: string
    size?: number
    etag?: string
}