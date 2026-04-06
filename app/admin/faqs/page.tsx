'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryFAQ {
  id: string;
  category_id: string;
  category_name: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<CategoryFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/admin/category-faqs');
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      const data = await response.json();
      setFaqs(data.faqs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Are you sure you want to delete "${question}"?`)) return;

    try {
      const response = await fetch(`/api/admin/category-faqs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete FAQ');

      setFaqs(faqs.filter(faq => faq.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete FAQ');
    }
  };

  const filteredFaqs = filterCategory
    ? faqs.filter(faq => faq.category_name.toLowerCase().includes(filterCategory.toLowerCase()))
    : faqs;

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
        <h3 className="font-semibold mb-2">Error loading FAQs</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Category FAQs</h1>
          <p className="text-gray-400 mt-1">Manage frequently asked questions for categories</p>
        </div>
        <Link
          href="/admin/faqs/new"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add FAQ
        </Link>
      </div>

      {faqs.length > 0 && (
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Filter by category..."
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          {filterCategory && (
            <button
              onClick={() => setFilterCategory('')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {filteredFaqs.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
          <svg
            className="w-16 h-16 text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">
            {faqs.length === 0 ? 'No FAQs yet' : 'No matching FAQs'}
          </h3>
          <p className="text-gray-400 mb-6">
            {faqs.length === 0
              ? 'Get started by creating your first FAQ'
              : 'Try adjusting your filter'}
          </p>
          {faqs.length === 0 && (
            <Link
              href="/admin/faqs/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First FAQ
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-900/30 text-cyan-400 border border-cyan-800">
                      {faq.category_name}
                    </span>
                    {faq.is_published ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                        Draft
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Sort: {faq.sort_order}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/faqs/${faq.id}`}
                    className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(faq.id, faq.question)}
                    className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
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
