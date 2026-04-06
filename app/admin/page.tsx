import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome to your admin panel
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/pages"
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Coloring Pages</h3>
              <p className="text-gray-400 text-sm">Manage all pages</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/pages/new"
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-pink-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Upload New</h3>
              <p className="text-gray-400 text-sm">Add coloring page</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-cyan-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Categories</h3>
              <p className="text-gray-400 text-sm">Manage categories</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/faqs"
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-blue-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Category FAQs</h3>
              <p className="text-gray-400 text-sm">Manage FAQs</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/books"
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-orange-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Coloring Books</h3>
              <p className="text-gray-400 text-sm">Manage books</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/home-faqs"
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-indigo-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Home FAQs</h3>
              <p className="text-gray-400 text-sm">Homepage FAQ section</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/seasonal-spotlight"
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-amber-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Seasonal Spotlight</h3>
              <p className="text-gray-400 text-sm">Homepage spotlight</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-8 border border-purple-800/50">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Admin Panel</h2>
        <p className="text-gray-300">
          Use the navigation menu on the left or the quick actions above to manage your coloring pages website.
        </p>
      </div>
    </div>
  );
}
