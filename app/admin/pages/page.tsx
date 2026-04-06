'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ColoringPage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: { id: string; name: string; slug: string } | null;
  bw_preview: string | null;
  color_preview: string | null;
  difficulty: string | null;
  age_range: string | null;
  is_popular: boolean;
  sort_order: number;
  updated_at: string;
}

export default function AdminPagesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingPages, setLoadingPages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // track per-category page counts
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Fetch all categories once
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/admin/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {
        // non-fatal, still show pages without category list
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  const fetchPages = useCallback(async (page: number = 1, categoryId: string | null = null) => {
    setLoadingPages(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: '24',
        offset: ((page - 1) * 24).toString(),
      });
      if (categoryId) params.set('category_id', categoryId);

      const res = await fetch(`/api/admin/coloring-pages?${params}`);
      if (!res.ok) throw new Error('Failed to fetch pages');

      const data = await res.json();
      const total = data.total || 0;
      setPages(data.pages || []);
      setPagination({
        page,
        total,
        totalPages: Math.ceil(total / 24),
        hasMore: page < Math.ceil(total / 24),
      });

      // cache count for this category tab
      if (categoryId) {
        setCategoryCounts(prev => ({ ...prev, [categoryId]: total }));
      } else {
        setCategoryCounts(prev => ({ ...prev, __all__: total }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoadingPages(false);
    }
  }, []);

  // Refetch when category selection changes
  useEffect(() => {
    fetchPages(1, selectedCategoryId);
  }, [selectedCategoryId, fetchPages]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setPages(prev => prev.filter(p => p.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete page');
    } finally {
      setDeletingId(null);
    }
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Coloring Pages</h1>
          <p className="text-gray-400 mt-1">
            {selectedCategory
              ? `${pagination.total} pages in "${selectedCategory.name}"`
              : `${pagination.total} pages total`}
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload New
        </Link>
      </div>

      <div className="flex gap-6 items-start">
        {/* Category Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</h2>
            </div>
            <nav className="p-2">
              {/* All Pages */}
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedCategoryId === null
                    ? 'bg-purple-600 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span>All Pages</span>
                {categoryCounts.__all__ !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCategoryId === null ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {categoryCounts.__all__}
                  </span>
                )}
              </button>

              {/* Category list */}
              {loadingCategories ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors mt-0.5 ${
                      selectedCategoryId === cat.id
                        ? 'bg-purple-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="truncate text-left">{cat.name}</span>
                    {categoryCounts[cat.id] !== undefined && (
                      <span className={`ml-2 flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full ${
                        selectedCategoryId === cat.id ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {categoryCounts[cat.id]}
                      </span>
                    )}
                  </button>
                ))
              )}
            </nav>
          </div>
        </aside>

        {/* Pages Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loadingPages && (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loadingPages && !error && pages.length === 0 && (
            <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
              <svg className="w-14 h-14 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-white mb-2">
                {selectedCategory ? `No pages in "${selectedCategory.name}" yet` : 'No coloring pages yet'}
              </h3>
              <p className="text-gray-400 mb-6 text-sm">Upload your first coloring page to get started</p>
              <Link
                href="/admin/pages/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Page
              </Link>
            </div>
          )}

          {/* Pages Grid */}
          {!loadingPages && !error && pages.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square bg-gray-800">
                    {(page.bw_preview || page.color_preview) ? (
                      <Image
                        src={page.bw_preview || page.color_preview || ''}
                        alt={page.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {page.is_popular && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded">
                        Popular
                      </span>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {page.bw_preview && (
                        <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-gray-700/90 text-gray-300">B&W</span>
                      )}
                      {page.color_preview && (
                        <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-purple-600/90 text-white">Color</span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-white text-sm font-medium truncate" title={page.title}>
                      {page.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {page.difficulty && `${page.difficulty}`}
                      {page.difficulty && page.age_range && ' • '}
                      {page.age_range && `${page.age_range}`}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-1.5 mt-3">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="flex-1 px-2 py-1.5 bg-purple-900/40 text-purple-300 text-xs text-center rounded-lg hover:bg-purple-900/60 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/free-coloring-pages/${page.slug}`}
                        target="_blank"
                        className="flex-1 px-2 py-1.5 bg-gray-800 text-gray-300 text-xs text-center rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(page.id, page.title)}
                        disabled={deletingId === page.id}
                        className="px-2 py-1.5 bg-red-900/30 text-red-400 text-xs rounded-lg hover:bg-red-900/50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === page.id ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loadingPages && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => fetchPages(pagination.page - 1, selectedCategoryId)}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-900 text-gray-400 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchPages(pagination.page + 1, selectedCategoryId)}
                disabled={!pagination.hasMore}
                className="px-4 py-2 bg-gray-900 text-gray-400 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
