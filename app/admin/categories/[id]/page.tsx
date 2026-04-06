'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  intro_text: string | null;
  related_categories: string | null;
  is_published: boolean;
  sort_order: number;
  thumbnail_url: string | null;
}

interface AllCategory {
  id: string;
  name: string;
  slug: string;
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<AllCategory[]>([]);

  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    title: '',
    meta_title: '',
    meta_description: '',
    keywords: '',
    intro_text: '',
    related_categories: null,
    is_published: true,
    sort_order: 0,
    thumbnail_url: '',
  });

  // Parse selected related category IDs from JSON string
  const selectedRelatedIds: string[] = (() => {
    try {
      return formData.related_categories ? JSON.parse(formData.related_categories) : [];
    } catch {
      return [];
    }
  })();

  const toggleRelatedCategory = (id: string) => {
    const current = selectedRelatedIds;
    const updated = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];
    setFormData(prev => ({ ...prev, related_categories: updated.length ? JSON.stringify(updated) : null }));
  };

  useEffect(() => {
    // Fetch all categories for the related-categories multi-select
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setAllCategories(data.categories || []))
      .catch(() => {});

    if (!isNew) {
      fetchCategory();
    }
  }, []);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/categories/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch category');
      const data = await response.json();
      setFormData(data.category);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
      title: prev.title || name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = isNew
        ? '/api/admin/categories'
        : `/api/admin/categories/${resolvedParams.id}`;

      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      router.push('/admin/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
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
          href="/admin/categories"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isNew ? 'Create Category' : 'Edit Category'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isNew ? 'Add a new category' : 'Update category details'}
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
          <h2 className="text-xl font-semibold text-white">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="e.g., Animals"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
                placeholder="e.g., animals"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Title *
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="e.g., Animal Coloring Pages"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="Describe this category..."
            />
            {!formData.description && (
              <div className="mt-2 flex items-start gap-2 px-3 py-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-xs text-yellow-300">Description is empty. Categories without a description are at risk of thin-content penalties.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Intro Text
            </label>
            <textarea
              rows={3}
              value={formData.intro_text || ''}
              onChange={(e) => setFormData({ ...formData, intro_text: e.target.value || null })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder={`e.g., Explore our collection of free printable ${formData.name || 'category'} coloring pages — perfect for kids, teens, and adults.`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Short 2–3 sentence intro shown above the image grid. Include keywords like &quot;free printable {formData.name || 'category'} coloring pages&quot;.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <label className="flex items-center gap-3 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published || false}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-white">Published</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Related Categories</h2>
            <p className="text-xs text-gray-500 mt-1">Select 4–6 related categories shown below the image grid on this category page.</p>
          </div>
          {allCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {allCategories
                .filter(c => c.id !== resolvedParams.id)
                .map(c => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-colors text-sm
                      ${selectedRelatedIds.includes(c.id)
                        ? 'bg-purple-900/30 border-purple-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRelatedIds.includes(c.id)}
                      onChange={() => toggleRelatedCategory(c.id)}
                      className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="truncate">{c.name}</span>
                  </label>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading categories...</p>
          )}
          {selectedRelatedIds.length > 0 && (
            <p className="text-xs text-gray-400">{selectedRelatedIds.length} categor{selectedRelatedIds.length === 1 ? 'y' : 'ies'} selected</p>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
          <h2 className="text-xl font-semibold text-white">Category Thumbnail</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.thumbnail_url || ''}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="https://example.com/category-thumbnail.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in the Browse by Category grid on the homepage. Leave empty to show a gradient placeholder.
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
          <h2 className="text-xl font-semibold text-white">SEO Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.meta_title || ''}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="Leave empty to use display title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta Description
            </label>
            <textarea
              rows={2}
              value={formData.meta_description || ''}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="SEO description for search engines"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Keywords
            </label>
            <input
              type="text"
              value={formData.keywords || ''}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="comma, separated, keywords"
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
                {isNew ? 'Create Category' : 'Save Changes'}
              </>
            )}
          </button>
          <Link
            href="/admin/categories"
            className="px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
