'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface FormState {
  heading: string;
  category_slug: string;
  page_ids_raw: string;
  is_active: boolean;
  sort_order: number;
}

export default function EditSeasonalSpotlightPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<FormState>({
    heading: '',
    category_slug: '',
    page_ids_raw: '',
    is_active: false,
    sort_order: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/seasonal-spotlight/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const s = data.spotlight;
        if (!s) throw new Error('Not found');
        const pageIds: string[] = JSON.parse(s.page_ids || '[]');
        setForm({
          heading: s.heading,
          category_slug: s.category_slug,
          page_ids_raw: pageIds.join(', '),
          is_active: s.is_active,
          sort_order: s.sort_order,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const page_ids = JSON.stringify(
      form.page_ids_raw.split(',').map((s) => s.trim()).filter(Boolean)
    );

    try {
      const res = await fetch(`/api/admin/seasonal-spotlight/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading: form.heading,
          category_slug: form.category_slug,
          page_ids,
          is_active: form.is_active,
          sort_order: form.sort_order,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Save failed');
      }
      router.push('/admin/seasonal-spotlight');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
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
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/seasonal-spotlight" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Seasonal Spotlight</h1>
          <p className="text-gray-400 mt-1">Update the homepage seasonal section</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-300 mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Heading *</label>
            <input
              type="text"
              required
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              placeholder="e.g., Easter Coloring Pages — Just Added"
            />
            <p className="text-xs text-gray-500 mt-1">This becomes the H2 heading of the section</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category Slug *</label>
            <input
              type="text"
              required
              value={form.category_slug}
              onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              placeholder="e.g., easter"
            />
            <p className="text-xs text-gray-500 mt-1">Used for the "View all" link — must match a category slug</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Page IDs *</label>
            <textarea
              required
              rows={4}
              value={form.page_ids_raw}
              onChange={(e) => setForm({ ...form, page_ids_raw: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 font-mono text-sm"
              placeholder="uuid-1, uuid-2, uuid-3"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated coloring page IDs to display (4–6 recommended)</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <label className="flex items-center gap-3 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-white">Active (shows on homepage)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
            ) : 'Save Changes'}
          </button>
          <Link href="/admin/seasonal-spotlight" className="px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
