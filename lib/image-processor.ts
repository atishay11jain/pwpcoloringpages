/**
 * Image Processing Service
 *
 * Uses Sharp for high-performance image optimization.
 * Generates multiple sizes and formats for optimal delivery.
 */

import sharp from 'sharp';

// Image size configurations
export const IMAGE_SIZES = {
  thumbnail: { width: 400, height: 400 },   // Grid view
  preview: { width: 800, height: 800 },     // Detail/modal view
  original: { width: 2000, height: 2000 },  // Download (max)
} as const;

// Quality settings (balance between size and quality)
export const QUALITY_SETTINGS = {
  webp: 85,      // WebP is efficient, can use higher quality
  jpeg: 85,      // Good balance for downloads
  png: 80,       // PNG compression level
} as const;

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  format: 'webp' | 'jpeg' | 'png';
}

export interface ProcessedImageSet {
  thumbnail: ProcessedImage;
  preview: ProcessedImage;
  original: ProcessedImage;
  metadata: {
    originalWidth: number;
    originalHeight: number;
    totalSize: number;
  };
}

/**
 * Get image metadata without processing
 */
export async function getImageMetadata(
  input: Buffer
): Promise<{ width: number; height: number; format: string }> {
  const metadata = await sharp(input).metadata();

  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    format: metadata.format ?? 'unknown',
  };
}

/**
 * Resize and optimize an image to WebP format
 */
export async function processToWebp(
  input: Buffer,
  maxWidth: number,
  maxHeight: number,
  quality: number = QUALITY_SETTINGS.webp
): Promise<ProcessedImage> {
  const result = await sharp(input)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    size: result.info.size,
    format: 'webp',
  };
}

/**
 * Resize and optimize an image to JPEG format
 */
export async function processToJpeg(
  input: Buffer,
  maxWidth: number,
  maxHeight: number,
  quality: number = QUALITY_SETTINGS.jpeg
): Promise<ProcessedImage> {
  const result = await sharp(input)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality,
      mozjpeg: true, // Use mozjpeg for better compression
    })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    size: result.info.size,
    format: 'jpeg',
  };
}

/**
 * Process an uploaded image into all required sizes
 * - Thumbnail: 400px WebP (for grid view)
 * - Preview: 800px WebP (for detail view)
 * - Original: Up to 2000px JPEG (for download)
 */
export async function processImageSet(
  input: Buffer
): Promise<ProcessedImageSet> {
  // Get original dimensions
  const metadata = await getImageMetadata(input);

  // Process all sizes in parallel for performance
  const [thumbnail, preview, original] = await Promise.all([
    processToWebp(input, IMAGE_SIZES.thumbnail.width, IMAGE_SIZES.thumbnail.height),
    processToWebp(input, IMAGE_SIZES.preview.width, IMAGE_SIZES.preview.height),
    processToJpeg(input, IMAGE_SIZES.original.width, IMAGE_SIZES.original.height),
  ]);

  const totalSize = thumbnail.size + preview.size + original.size;

  return {
    thumbnail,
    preview,
    original,
    metadata: {
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      totalSize,
    },
  };
}

/**
 * Convert an image to PDF
 * Creates a single-page PDF with the image
 */
export async function imageToPdf(
  input: Buffer,
  options: {
    pageSize?: 'letter' | 'a4';
    margin?: number;
  } = {}
): Promise<Buffer> {
  const { pageSize = 'letter', margin = 36 } = options; // 36 points = 0.5 inch

  // Page dimensions in points (72 points = 1 inch)
  const pageSizes = {
    letter: { width: 612, height: 792 },   // 8.5 x 11 inches
    a4: { width: 595, height: 842 },       // 210 x 297 mm
  };

  const page = pageSizes[pageSize];
  const availableWidth = page.width - margin * 2;
  const availableHeight = page.height - margin * 2;

  // Get image metadata
  const metadata = await getImageMetadata(input);

  // Calculate scaling to fit within available space
  const scaleX = availableWidth / metadata.width;
  const scaleY = availableHeight / metadata.height;
  const scale = Math.min(scaleX, scaleY, 1); // Don't upscale

  const scaledWidth = Math.round(metadata.width * scale);
  const scaledHeight = Math.round(metadata.height * scale);

  // Center the image
  const x = Math.round(margin + (availableWidth - scaledWidth) / 2);
  const y = Math.round(margin + (availableHeight - scaledHeight) / 2);

  // Resize image to fit
  const resizedImage = await sharp(input)
    .resize(scaledWidth, scaledHeight, { fit: 'inside' })
    .png() // PNG for lossless in PDF
    .toBuffer();

  // Create PDF with white background and centered image
  // Using Sharp's composite feature with a white base
  const pdfImage = await sharp({
    create: {
      width: page.width,
      height: page.height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      {
        input: resizedImage,
        top: y,
        left: x,
      },
    ])
    .png()
    .toBuffer();

  // Note: For actual PDF generation, you'd need a PDF library like pdf-lib
  // Sharp creates an image, not a true PDF. For now, return high-quality JPEG
  // In production, use pdf-lib or similar for true PDF output
  return sharp(pdfImage)
    .jpeg({ quality: 95 })
    .toBuffer();
}

/**
 * Validate uploaded file
 */
export function validateImageFile(
  file: { size: number; type: string; name: string },
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Generate a blur placeholder for progressive loading
 */
export async function generateBlurPlaceholder(input: Buffer): Promise<string> {
  const blurBuffer = await sharp(input)
    .resize(10, 10, { fit: 'inside' })
    .blur()
    .toBuffer();

  return `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
}

/**
 * Extract dominant colors from an image (for UI theming)
 */
export async function extractDominantColors(
  input: Buffer,
  count: number = 5
): Promise<string[]> {
  const { dominant } = await sharp(input)
    .resize(100, 100, { fit: 'inside' })
    .stats();

  // Return the dominant color as hex
  const r = Math.round(dominant.r);
  const g = Math.round(dominant.g);
  const b = Math.round(dominant.b);

  const dominantHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  // For a more complete implementation, you'd use a color extraction library
  return [dominantHex];
}

/**
 * Optimize an existing image without resizing
 */
export async function optimizeImage(
  input: Buffer,
  format: 'webp' | 'jpeg' | 'png' = 'webp'
): Promise<ProcessedImage> {
  const metadata = await getImageMetadata(input);

  let processor = sharp(input);

  switch (format) {
    case 'webp':
      processor = processor.webp({ quality: QUALITY_SETTINGS.webp });
      break;
    case 'jpeg':
      processor = processor.jpeg({ quality: QUALITY_SETTINGS.jpeg, mozjpeg: true });
      break;
    case 'png':
      processor = processor.png({ compressionLevel: 9 });
      break;
  }

  const result = await processor.toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    size: result.info.size,
    format,
  };
}

/**
 * Create a coloring page from a color image (grayscale with high contrast)
 * Useful for converting color images to black & white coloring pages
 */
export async function createColoringPage(input: Buffer): Promise<ProcessedImage> {
  const result = await sharp(input)
    .grayscale()
    .normalize() // Enhance contrast
    .sharpen() // Add slight sharpening for crisp lines
    .jpeg({ quality: 90 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    size: result.info.size,
    format: 'jpeg',
  };
}
