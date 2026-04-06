'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  intro_text: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  sort_order: number;
  count: number;
  created_at: string;
  updated_at: string;
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const CACHE_KEY = 'coloring_pages_categories';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedData {
  categories: Category[];
  timestamp: number;
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check localStorage cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { categories: cachedCategories, timestamp }: CachedData = JSON.parse(cached);
          const now = Date.now();
          const cacheAge = now - timestamp;
          const cacheAgeMinutes = Math.floor(cacheAge / 60000);

          // If cache is still valid (less than 5 minutes old), use it
          if (cacheAge < CACHE_DURATION) {
            console.log(
              `✅ [CategoriesCache] Using cached data (age: ${cacheAgeMinutes} min ${Math.floor((cacheAge % 60000) / 1000)} sec)`
            );
            setCategories(cachedCategories);
            setLoading(false);
            return;
          } else {
            console.log(
              `⏰ [CategoriesCache] Cache expired (age: ${cacheAgeMinutes} min) - fetching fresh data`
            );
          }
        } catch (parseError) {
          console.warn('⚠️ [CategoriesCache] Invalid cache data - removing and refetching');
          localStorage.removeItem(CACHE_KEY);
        }
      } else {
        console.log('🔍 [CategoriesCache] No cache found - fetching from API');
      }

      // Cache is invalid or doesn't exist, fetch from API
      console.log('📡 [CategoriesCache] Fetching from /api/categories');
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.categories) {
        setCategories(data.categories);

        // Cache in localStorage with timestamp
        const cacheData: CachedData = {
          categories: data.categories,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log(
          `💾 [CategoriesCache] Cached ${data.categories.length} categories for 5 minutes`
        );
      }
    } catch (err) {
      console.error('❌ [CategoriesCache] Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ [CategoriesCache] Cache cleared manually');
  }, []);

  useEffect(() => {
    console.log('🚀 [CategoriesCache] Provider initialized - checking cache...');
    fetchCategories();
  }, [fetchCategories]);

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    totalCount,
    refetch: fetchCategories,
    clearCache,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
