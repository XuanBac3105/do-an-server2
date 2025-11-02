import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'
import z from 'zod'

const envPath = path.resolve('.env')
if (fs.existsSync(envPath)) {
    config({ path: envPath })
} else {
    console.log('File .env không tồn tại - sử dụng biến môi trường từ hệ thống')
}

const configSchema = z.object({
    DATABASE_URL: z.string(),
    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRES_IN: z.string(),
    REFRESH_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_EXPIRES_IN: z.string(),
    ADMIN_FULL_NAME: z.string(),
    ADMIN_PASSWORD: z.string(),
    ADMIN_EMAIL: z.string(),
    ADMIN_PHONE_NUMBER: z.string(),
    RESEND_API_KEY: z.string(),
    MINIO_ENDPOINT: z.string(),
    MINIO_ACCESS_KEY: z.string(),
    MINIO_SECRET_KEY: z.string(),
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
    console.log('Các giá trị khai báo trong .env không hợp lệ')
    
    // Trong môi trường test, sử dụng giá trị mặc định thay vì exit
    if (process.env.NODE_ENV === 'test' || process.env.CI === 'true') {
        console.log('Chạy trong môi trường test - sử dụng giá trị mặc định')
    } else {
        process.exit(1)
    }
}

const envConfig = configServer.success ? configServer.data : {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'test-access-token-secret',
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'test-refresh-token-secret',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    ADMIN_FULL_NAME: process.env.ADMIN_FULL_NAME || 'Test Admin',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'test-password',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'test@example.com',
    ADMIN_PHONE_NUMBER: process.env.ADMIN_PHONE_NUMBER || '0000000000',
    RESEND_API_KEY: process.env.RESEND_API_KEY || 'test-resend-key',
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'test-access',
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || 'test-secret',
}

export default envConfig
