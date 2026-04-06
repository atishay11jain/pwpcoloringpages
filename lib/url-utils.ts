/**
 * URL utility functions for coloring pages
 */

/**
 * Convert an R2 storage key to a public URL.
 * Pure string function — no AWS SDK required.
 */
export function getPublicAssetUrl(key: string): string {
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (publicUrl) return `${publicUrl}/${key}`;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  return `https://${bucket}.${accountId}.r2.dev/${key}`;
}

/**
 * Convert a database slug to a page URL
 * Database slug: "cute-mermaid"
 * Page URL: "/cute-mermaid-coloring-page"
 */
export function getColoringPageUrl(slug: string): string {
  return `/${slug}-coloring-page`;
}

/**
 * Convert a page URL slug to database slug
 * URL slug: "cute-mermaid-coloring-page"
 * Database slug: "cute-mermaid"
 */
export function getDbSlugFromUrl(urlSlug: string): string {
  return urlSlug.endsWith('-coloring-page')
    ? urlSlug.replace('-coloring-page', '')
    : urlSlug;
}

/**
 * Convert a category slug to category page URL
 * Database slug: "animals"
 * Page URL: "/animals-coloring-pages"
 */
export function getCategoryUrl(slug: string): string {
  return `/${slug}-coloring-pages`;
}

/**
 * Check if a URL is a category page
 */
export function isCategoryUrl(urlSlug: string): boolean {
  return urlSlug.endsWith('-coloring-pages');
}

/**
 * Check if a URL is a coloring page
 */
export function isColoringPageUrl(urlSlug: string): boolean {
  return urlSlug.endsWith('-coloring-page');
}
