'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ColoringBook {
  id: string;
  title: string;
  description: string | null;
  cover_image_key: string | null;
  buy_url: string | null;
  status: 'coming_soon' | 'available' | 'out_of_stock';
  sort_order: number;
  created_at: string;
}

export default function ColoringBooksPage() {
  const [books, setBooks] = useState<ColoringBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/admin/coloring-books');
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data.books);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const response = await fetch(`/api/admin/coloring-books/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete book');

      setBooks(books.filter(book => book.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete book');
    }
  };

  const statusColors = {
    coming_soon: 'bg-blue-900/30 text-blue-400 border-blue-800',
    available: 'bg-green-900/30 text-green-400 border-green-800',
    out_of_stock: 'bg-red-900/30 text-red-400 border-red-800',
  };

  const statusLabels = {
    coming_soon: 'Coming Soon',
    available: 'Available',
    out_of_stock: 'Out of Stock',
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
        <h3 className="font-semibold mb-2">Error loading books</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Coloring Books</h1>
          <p className="text-gray-400 mt-1">Manage your coloring books</p>
        </div>
        <Link
          href="/admin/books/new"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Book
        </Link>
      </div>

      {books.length === 0 ? (
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No books yet</h3>
          <p className="text-gray-400 mb-6">Get started by adding your first coloring book</p>
          <Link
            href="/admin/books/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add First Book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-purple-600 transition-colors">
              {book.cover_image_key ? (
                <img
                  src={book.cover_image_key}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex-1">{book.title}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ml-2 ${statusColors[book.status]}`}>
                    {statusLabels[book.status]}
                  </span>
                </div>

                {book.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{book.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>Sort: {book.sort_order}</span>
                  {book.buy_url && (
                    <>
                      <span>•</span>
                      <span>Has buy link</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/books/${book.id}`}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    className="px-4 py-2 bg-red-900/30 text-red-400 text-sm font-medium rounded-lg hover:bg-red-900/50 transition-colors border border-red-800"
                  >
                    Delete
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
