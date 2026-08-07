import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function region(): string { return process.env.AWS_REGION || '' }
function bucket(): string { return process.env.AWS_S3_BUCKET_NAME || '' }

let cachedClient: S3Client | null = null
function getS3(): S3Client {
  if (cachedClient) return cachedClient
  cachedClient = new S3Client({
    region: region(),
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  })
  return cachedClient
}

export function publicUrlForKey(key: string): string {
  return `https://${bucket()}.s3.${region()}.amazonaws.com/${key}`
}

/**
 * Returns a short-lived presigned PUT URL the browser can upload directly to.
 * The caller must PUT the raw file bytes to `url` with the given `contentType` header.
 */
export async function getPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType })
  const url = await getSignedUrl(getS3(), command, { expiresIn: 300 })
  return { url, key, publicUrl: publicUrlForKey(key) }
}

export async function deleteFromS3(key: string): Promise<void> {
  await getS3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }))
}

export function buildMediaKey(section: string, verticalSlug: string | null, filename: string) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const prefix = verticalSlug ? `${section}/${verticalSlug}` : section
  return `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`
}
