import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'
import z from 'zod'

// ✅ Load file .env nếu có
const envPath = path.resolve('.env')
if (fs.existsSync(envPath)) {
    config({ path: envPath })
    console.log('Đã load cấu hình từ .env')
} else {
    console.warn('⚠️ Không tìm thấy file .env — sử dụng biến môi trường mặc định')
}

// ✅ Định nghĩa schema cho toàn bộ biến môi trường
const configSchema = z.object({
    DATABASE_URL: z.string().url(),

    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRES_IN: z.string(),
    REFRESH_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_EXPIRES_IN: z.string(),

    ADMIN_FULL_NAME: z.string(),
    ADMIN_PASSWORD: z.string(),
    ADMIN_EMAIL: z.string().email(),
    ADMIN_PHONE_NUMBER: z.string(),
    RESEND_API_KEY: z.string(),

    MINIO_ENDPOINT: z.string(),
    MINIO_PORT: z.coerce.number().default(9000),
    MINIO_ACCESS_KEY: z.string(),
    MINIO_SECRET_KEY: z.string(),
    MINIO_USE_SSL: z
        .string()
        .optional()
        .default('false')
        .transform((v) => v === 'true' || v === '1' || v === 'yes'),
    MINIO_BUCKET_NAME: z.string(),
})

// ✅ Parse env và validate
const parsed = configSchema.safeParse(process.env)

if (!parsed.success) {
    console.error('❌ Lỗi cấu hình .env:', parsed.error.flatten().fieldErrors)
    if (process.env.NODE_ENV !== 'test' && process.env.CI !== 'true') {
        process.exit(1)
    }
    console.warn('⚠️ Đang chạy trong môi trường test/CI — bỏ qua lỗi env.')
}

// ✅ Xuất object cấu hình dùng toàn project
export const envConfig = parsed.success
    ? parsed.data
    : {
          DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/app_db?schema=public',
          ACCESS_TOKEN_SECRET: 'default-access-secret',
          ACCESS_TOKEN_EXPIRES_IN: '1h',
          REFRESH_TOKEN_SECRET: 'default-refresh-secret',
          REFRESH_TOKEN_EXPIRES_IN: '30d',
          ADMIN_FULL_NAME: 'Admin',
          ADMIN_PASSWORD: 'admin123',
          ADMIN_EMAIL: 'admin@example.com',
          ADMIN_PHONE_NUMBER: '0000000000',
          RESEND_API_KEY: 'test-resend',
          MINIO_ENDPOINT: 'localhost',
          MINIO_PORT: 9000,
          MINIO_ACCESS_KEY: 'minioadmin',
          MINIO_SECRET_KEY: 'minioadmin123',
          MINIO_USE_SSL: false,
          MINIO_BUCKET_NAME: 'default-bucket',
      }

export default envConfig
