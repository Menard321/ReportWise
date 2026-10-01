import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'

// Standard setup that works with AWS or Cloudflare R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || ''
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || ''
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'reportwise-assets'

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
})

export async function generatePresignedUrl(fileName: string, fileType: string) {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  })

  // Presigned URL valid for 5 minutes
  return await getSignedUrl(s3Client, command, { expiresIn: 300 })
}
