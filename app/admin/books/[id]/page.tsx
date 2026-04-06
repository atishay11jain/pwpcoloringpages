'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ColoringBook {
  id: string;
  title: string;
  description: string | null;
  cover_image_key: string | null;
  buy_url: string | null;
  status: 'coming_soon' | 'available' | 'out_of_stock';
  sort_order: number;
  rating: number | null;
  rating_count: number | null;
}

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ColoringBook>>({
    title: '',
    description: '',
    cover_image_key: '',
    buy_url: '',
    status: 'coming_soon',
    sort_order: 0,
    rating: null,
    rating_count: null,
  });

  useEffect(() => {
    if (!isNew) {
      fetchBook();
    }
  }, []);

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/admin/coloring-books/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch book');
      const data = await response.json();
      setFormData(data.book);
      setCoverPreview(data.book.cover_image_url ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isNew && !resolvedParams.id) {
      alert('Please save the book first before uploading a cover image');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // If new, save the book first
      let bookId = resolvedParams.id;
      if (isNew) {
        const saveResponse = await fetch('/api/admin/coloring-books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!saveResponse.ok) throw new Error('Failed to save book');
        const saveData = await saveResponse.json();
        bookId = saveData.book.id;
      }

      // Upload image
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await fetch(`/api/admin/coloring-books/${bookId}/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      setFormData(prev => ({ ...prev, cover_image_key: data.url }));
      setCoverPreview(data.url);

      if (isNew) {
        router.push(`/admin/books/${bookId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = isNew
        ? '/api/admin/coloring-books'
        : `/api/admin/coloring-books/${resolvedParams.id}`;

      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save book');
      }

      router.push('/admin/books');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save book');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/books"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isNew ? 'Create Coloring Book' : 'Edit Coloring Book'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isNew ? 'Add a new coloring book' : 'Update book details'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-300 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
          <h2 className="text-xl font-semibold text-white">Cover Image</h2>

          <div>
            {coverPreview ? (
              <div className="relative inline-block">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-64 h-64 object-cover rounded-lg border-2 border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview(null);
                    setFormData(prev => ({ ...prev, cover_image_key: '' }));
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-64 h-64 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-400">
                  {uploading ? 'Uploading...' : 'Click to upload cover'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
          <h2 className="text-xl font-semibold text-white">Book Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="e.g., My Amazing Coloring Book"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="Describe this coloring book..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buy URL
            </label>
            <input
              type="url"
              value={formData.buy_url || ''}
              onChange={(e) => setFormData({ ...formData, buy_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="https://amazon.com/..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status || 'coming_soon'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="coming_soon">Coming Soon</option>
                <option value="available">Available</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order || 0}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amazon Rating
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating ?? ''}
                onChange={(e) => setFormData({
                  ...formData,
                  rating: e.target.value === '' ? null : parseFloat(e.target.value),
                })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="e.g. 4.7"
              />
              <p className="text-xs text-gray-500 mt-1">Average star rating (0–5)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Ratings
              </label>
              <input
                type="number"
                min="0"
                value={formData.rating_count ?? ''}
                onChange={(e) => setFormData({
                  ...formData,
                  rating_count: e.target.value === '' ? null : parseInt(e.target.value, 10),
                })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="e.g. 1842"
              />
              <p className="text-xs text-gray-500 mt-1">Total Amazon review count</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isNew ? 'Create Book' : 'Save Changes'}
              </>
            )}
          </button>
          <Link
            href="/admin/books"
            className="px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
