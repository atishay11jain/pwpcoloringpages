/**
 * Cloudflare R2 Storage Client
 *
 * Uses AWS SDK v3 for S3-compatible operations with R2.
 * R2 provides zero egress fees, making it ideal for serving images.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 Configuration
function getR2Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      'Missing Cloudflare R2 configuration. Required env vars: ' +
      'CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY, CLOUDFLARE_R2_BUCKET'
    );
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

// Lazy-initialized S3 client
let s3Client: S3Client | null = null;

function getClient(): S3Client {
  if (!s3Client) {
    const config = getR2Config();
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return s3Client;
}

/**
 * Get the bucket name
 */
function getBucket(): string {
  return process.env.CLOUDFLARE_R2_BUCKET!;
}

/**
 * Get the public URL for a file
 */
export function getPublicUrl(key: string): string {
  // Guard: if key is already a full URL (e.g. corrupted data), return as-is
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/${key}`;
  }
  // Fallback to R2.dev URL (must be enabled in R2 dashboard)
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  return `https://${bucket}.${accountId}.r2.dev/${key}`;
}

/**
 * Upload a file to R2
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | ReadableStream,
  options: {
    contentType?: string;
    cacheControl?: string;
    metadata?: Record<string, string>;
  } = {}
): Promise<{ key: string; url: string; size: number }> {
  const client = getClient();
  const bucket = getBucket();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: options.contentType ?? 'application/octet-stream',
    CacheControl: options.cacheControl ?? 'public, max-age=31536000, immutable',
    Metadata: options.metadata,
  });

  await client.send(command);

  const size = body instanceof Buffer ? body.length : 0;

  return {
    key,
    url: getPublicUrl(key),
    size,
  };
}

/**
 * Upload an image with appropriate content type and caching
 */
export async function uploadImage(
  key: string,
  buffer: Buffer,
  format: 'jpeg' | 'webp' | 'png'
): Promise<{ key: string; url: string; size: number }> {
  const contentTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    png: 'image/png',
  };

  return uploadFile(key, buffer, {
    contentType: contentTypes[format],
    // Long cache for images (1 year, immutable)
    cacheControl: 'public, max-age=31536000, immutable',
  });
}

/**
 * Upload a PDF file
 */
export async function uploadPdf(
  key: string,
  buffer: Buffer
): Promise<{ key: string; url: string; size: number }> {
  return uploadFile(key, buffer, {
    contentType: 'application/pdf',
    cacheControl: 'public, max-age=31536000, immutable',
  });
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getClient();
  const bucket = getBucket();

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
}

/**
 * Delete multiple files from R2
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  await Promise.all(keys.map(key => deleteFile(key)));
}

/**
 * Check if a file exists in R2
 */
export async function fileExists(key: string): Promise<boolean> {
  const client = getClient();
  const bucket = getBucket();

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(key: string): Promise<{
  size: number;
  contentType: string;
  lastModified: Date;
} | null> {
  const client = getClient();
  const bucket = getBucket();

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await client.send(command);

    return {
      size: response.ContentLength ?? 0,
      contentType: response.ContentType ?? 'application/octet-stream',
      lastModified: response.LastModified ?? new Date(),
    };
  } catch {
    return null;
  }
}

/**
 * Get a signed URL for temporary access (useful for private downloads)
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const client = getClient();
  const bucket = getBucket();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Get a signed URL for uploading (useful for direct browser uploads)
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const client = getClient();
  const bucket = getBucket();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * List files with a prefix (useful for listing all versions of an image)
 */
export async function listFiles(
  prefix: string,
  maxKeys: number = 100
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
  const client = getClient();
  const bucket = getBucket();

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const response = await client.send(command);

  return (response.Contents ?? []).map(item => ({
    key: item.Key ?? '',
    size: item.Size ?? 0,
    lastModified: item.LastModified ?? new Date(),
  }));
}

/**
 * Slugify a string for use in URLs and file paths
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate storage keys for a coloring page
 *
 * Structure: {type}/{category-slug}/{image-slug}-{uniqueId}/filename
 *
 * Example: bw/spiderman/spiderman-swinging-abc123/thumb.webp
 */
export function generatePageKeys(options: {
  pageId: string;
  type: 'bw' | 'color';
  categorySlug: string;
  imageSlug: string;
}): {
  thumbnailKey: string;
  previewKey: string;
  originalKey: string;
  pdfKey: string;
  folderPath: string;
} {
  const { pageId, type, categorySlug, imageSlug } = options;

  // Create clean slugs
  const cleanCategorySlug = slugify(categorySlug);
  const cleanImageSlug = slugify(imageSlug);

  // Get short unique ID from pageId (last 8 chars)
  const uniqueId = pageId.slice(-8);

  // Build folder path: {type}/{category-slug}/{image-slug}-{uniqueId}
  const folderPath = `${type}/${cleanCategorySlug}/${cleanImageSlug}-${uniqueId}`;

  return {
    thumbnailKey: `${folderPath}/thumb.webp`,
    previewKey: `${folderPath}/preview.webp`,
    originalKey: `${folderPath}/original.jpg`,
    pdfKey: `${folderPath}/print.pdf`,
    folderPath,
  };
}

/**
 * Generate storage keys for a coloring book
 *
 * Structure: coloring-books/{book-title-slug}-{bookId}/{uniqueId}
 *
 * Example: coloring-books/spiderman-adventures-06af9a9f/4f9703f1
 */
export function generateBookKeys(options: {
  bookId: string;
  bookTitle: string;
  uniqueId?: string;
}): {
  coverKey: string;
  folderPath: string;
} {
  const { bookId, bookTitle, uniqueId } = options;

  // Create clean slug from book title
  const titleSlug = slugify(bookTitle);

  // Get short book ID (first 8 chars)
  const shortBookId = bookId.slice(0, 8);

  // Build base folder path: coloring-books/{title-slug}-{bookId}
  const baseFolder = `coloring-books/${titleSlug}-${shortBookId}`;

  // If uniqueId is provided, use it for the subfolder
  const folderPath = uniqueId ? `${baseFolder}/${uniqueId}` : baseFolder;

  return {
    coverKey: `${folderPath}/cover.webp`,
    folderPath,
  };
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  breakdown: Record<string, { count: number; size: number }>;
}> {
  const client = getClient();
  const bucket = getBucket();

  let totalFiles = 0;
  let totalSize = 0;
  const breakdown: Record<string, { count: number; size: number }> = {
    thumbnails: { count: 0, size: 0 },
    previews: { count: 0, size: 0 },
    originals: { count: 0, size: 0 },
    pdfs: { count: 0, size: 0 },
    other: { count: 0, size: 0 },
  };

  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    });

    const response = await client.send(command);

    for (const item of response.Contents ?? []) {
      totalFiles++;
      totalSize += item.Size ?? 0;

      const key = item.Key ?? '';
      const size = item.Size ?? 0;

      if (key.includes('-thumb.webp')) {
        breakdown.thumbnails.count++;
        breakdown.thumbnails.size += size;
      } else if (key.includes('-preview.webp')) {
        breakdown.previews.count++;
        breakdown.previews.size += size;
      } else if (key.includes('-original.jpg')) {
        breakdown.originals.count++;
        breakdown.originals.size += size;
      } else if (key.endsWith('.pdf')) {
        breakdown.pdfs.count++;
        breakdown.pdfs.size += size;
      } else {
        breakdown.other.count++;
        breakdown.other.size += size;
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return { totalFiles, totalSize, breakdown };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
