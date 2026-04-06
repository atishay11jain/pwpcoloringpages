'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ColoringPage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string;
  possible_categories: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  age_range: string | null;
  is_popular: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  printing_tips: string | null;
}

interface Category {
  id: string;
  name: string;
  title: string;
  slug: string;
}

export default function EditColoringPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<Partial<ColoringPage>>({
    title: '',
    slug: '',
    description: '',
    category_id: '',
    possible_categories: null,
    difficulty: null,
    age_range: '',
    is_popular: false,
    sort_order: 0,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    printing_tips: '',
  });

  useEffect(() => {
    Promise.all([fetchPage(), fetchCategories()]);
  }, []);

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/admin/coloring-pages/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch page');
      const data = await response.json();
      setFormData(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch {
      // non-blocking
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/coloring-pages/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      setSuccess('Changes saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
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
          href="/admin/pages"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Coloring Page</h1>
          <p className="text-gray-400 mt-1 truncate max-w-md">{formData.title}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-300 mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-800 rounded-xl p-4 text-green-300 mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
          <h2 className="text-xl font-semibold text-white">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
            <input
              type="text"
              required
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Primary Category *</label>
            <select
              required
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page Details */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
          <h2 className="text-xl font-semibold text-white">Page Details</h2>

          {/* Sort Order — prominently placed */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
            <input
              type="number"
              min={0}
              value={formData.sort_order ?? 0}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first within the category. Pages with the same value are sorted by popularity then date.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={formData.difficulty || ''}
                onChange={(e) => setFormData({ ...formData, difficulty: (e.target.value as ColoringPage['difficulty']) || null })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Not specified</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age Range</label>
              <select
                value={formData.age_range || ''}
                onChange={(e) => setFormData({ ...formData, age_range: e.target.value || null })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">— Select age range —</option>
                <option value="toddler">Toddlers (Ages 1–3)</option>
                <option value="kids">Kids (Ages 4–12)</option>
                <option value="teens">Teens (Ages 13–17)</option>
                <option value="adults">Adults (All ages)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_popular || false}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-300">Mark as Popular / Trending</span>
            </label>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
          <h2 className="text-xl font-semibold text-white">SEO Metadata</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Meta Title</label>
            <input
              type="text"
              value={formData.meta_title || ''}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="Leave empty to use page title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Meta Description</label>
            <textarea
              rows={2}
              value={formData.meta_description || ''}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Meta Keywords</label>
            <input
              type="text"
              value={formData.meta_keywords || ''}
              onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="comma, separated, keywords"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Printing Tips</label>
            <textarea
              rows={3}
              value={formData.printing_tips || ''}
              onChange={(e) => setFormData({ ...formData, printing_tips: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="Custom printing tips for this page (leave empty to use auto-generated tips)"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
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
                Save Changes
              </>
            )}
          </button>
          <Link
            href="/admin/pages"
            className="px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <Link
            href={`/free-coloring-pages/${formData.slug}`}
            target="_blank"
            className="ml-auto px-4 py-3 bg-gray-800 text-gray-400 text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on site
          </Link>
        </div>
      </form>
    </div>
  );
}
