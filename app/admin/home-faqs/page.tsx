'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HomeFAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
}

export default function HomeFAQsPage() {
  const [faqs, setFaqs] = useState<HomeFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchFAQs(); }, []);

  const fetchFAQs = async () => {
    try {
      const res = await fetch('/api/admin/home-faqs');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setFaqs(data.faqs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Delete "${question}"?`)) return;
    try {
      const res = await fetch(`/api/admin/home-faqs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setFaqs(faqs.filter((f) => f.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const togglePublished = async (faq: HomeFAQ) => {
    try {
      await fetch(`/api/admin/home-faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !faq.is_published }),
      });
      setFaqs(faqs.map((f) => f.id === faq.id ? { ...f, is_published: !f.is_published } : f));
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
          <h1 className="text-3xl font-bold text-white">Home FAQs</h1>
          <p className="text-gray-400 mt-1">Manage homepage FAQ accordion and FAQPage schema</p>
        </div>
        <Link
          href="/admin/home-faqs/new"
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add FAQ
        </Link>
      </div>

      {faqs.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-2">No FAQs yet</h3>
          <p className="text-gray-400 mb-6">Create FAQs to power the homepage accordion and SEO schema.</p>
          <Link href="/admin/home-faqs/new" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Add First FAQ
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-xs text-gray-500 font-mono">#{faq.sort_order}</span>
                    {faq.is_published ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">Published</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">Draft</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold mb-1 leading-snug">{faq.question}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePublished(faq)}
                    className="p-2 text-yellow-400 hover:bg-yellow-900/30 rounded-lg transition-colors"
                    title={faq.is_published ? 'Unpublish' : 'Publish'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={faq.is_published ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} />
                    </svg>
                  </button>
                  <Link href={`/admin/home-faqs/${faq.id}`} className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button onClick={() => handleDelete(faq.id, faq.question)} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
