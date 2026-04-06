'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Spotlight {
  id: string;
  heading: string;
  category_slug: string;
  page_ids: string;
  is_active: boolean;
  sort_order: number;
}

export default function SeasonalSpotlightPage() {
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchSpotlights(); }, []);

  const fetchSpotlights = async () => {
    try {
      const res = await fetch('/api/admin/seasonal-spotlight');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSpotlights(data.spotlights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, heading: string) => {
    if (!confirm(`Delete "${heading}"?`)) return;
    try {
      const res = await fetch(`/api/admin/seasonal-spotlight/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setSpotlights(spotlights.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const toggleActive = async (spotlight: Spotlight) => {
    try {
      await fetch(`/api/admin/seasonal-spotlight/${spotlight.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !spotlight.is_active }),
      });
      setSpotlights(spotlights.map((s) =>
        s.id === spotlight.id ? { ...s, is_active: !s.is_active } : s
      ));
    } catch {
      alert('Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-red-300">
        <h3 className="font-semibold mb-2">Error</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Seasonal Spotlight</h1>
          <p className="text-gray-400 mt-1">Manage the homepage seasonal/holiday spotlight section</p>
        </div>
        <Link
          href="/admin/seasonal-spotlight/new"
          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Spotlight
        </Link>
      </div>

      <div className="bg-orange-900/20 border border-orange-800/50 rounded-xl p-4 text-orange-300 text-sm">
        Only one spotlight can be <strong>active</strong> at a time — the active one appears on the homepage. Toggle others off before activating a new one.
      </div>

      {spotlights.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-2">No spotlights yet</h3>
          <p className="text-gray-400 mb-6">Create a seasonal spotlight to highlight holiday or trending coloring pages on the homepage.</p>
          <Link href="/admin/seasonal-spotlight/new" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors">
            Add First Spotlight
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {spotlights.map((spotlight) => {
            const pageCount = (() => { try { return JSON.parse(spotlight.page_ids).length; } catch { return 0; } })();
            return (
              <div key={spotlight.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-xs text-gray-500 font-mono">#{spotlight.sort_order}</span>
                      {spotlight.is_active ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">Active</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">Inactive</span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-900/30 text-orange-400 border border-orange-800">
                        {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-1 leading-snug">{spotlight.heading}</h3>
                    <p className="text-gray-500 text-sm font-mono">Category: {spotlight.category_slug}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(spotlight)}
                      className="p-2 text-yellow-400 hover:bg-yellow-900/30 rounded-lg transition-colors"
                      title={spotlight.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={spotlight.is_active ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} />
                      </svg>
                    </button>
                    <Link href={`/admin/seasonal-spotlight/${spotlight.id}`} className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button onClick={() => handleDelete(spotlight.id, spotlight.heading)} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
