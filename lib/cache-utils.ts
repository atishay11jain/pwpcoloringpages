/**
 * Cache utility functions for client-side caching
 */

const CACHE_KEYS = {
  CATEGORIES: 'coloring_pages_categories',
} as const;

/**
 * Clear the categories cache
 * Call this after creating, updating, or deleting categories
 */
export function clearCategoriesCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEYS.CATEGORIES);
  }
}

/**
 * Clear all application caches
 */
export function clearAllCaches(): void {
  if (typeof window !== 'undefined') {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

/**
 * Get cache age in milliseconds
 * Returns -1 if cache doesn't exist
 */
export function getCacheAge(key: string): number {
  if (typeof window === 'undefined') return -1;

  const cached = localStorage.getItem(key);
  if (!cached) return -1;

  try {
    const { timestamp } = JSON.parse(cached);
    return Date.now() - timestamp;
  } catch {
    return -1;
  }
}

/**
 * Check if cache is still valid
 */
export function isCacheValid(key: string, maxAge: number): boolean {
  const age = getCacheAge(key);
  return age !== -1 && age < maxAge;
}
