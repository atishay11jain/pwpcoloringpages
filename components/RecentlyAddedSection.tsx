'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RecentPage {
  id: string;
  title: string;
  slug: string;
  images: {
    bwPreview: string | null;
    colorPreview: string | null;
  };
  categoryId: string;
}

function RecentCard({ page }: { page: RecentPage }) {
  const imageUrl = page.images.bwPreview || page.images.colorPreview;

  return (
    <Link
      href={`/${page.slug}`}
      className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/10 bg-[#12121a]"
    >
      {/* New badge */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-xs font-bold font-dm-sans bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg">
        New
      </div>

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={page.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-sm font-dm-sans font-medium bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
            Download Free
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="p-3">
        <h3 className="text-white text-sm font-dm-sans font-medium line-clamp-2 group-hover:text-pink-300 transition-colors leading-snug">
          {page.title.replace(/\s+coloring[\s-]page$/i, '').trim()}
        </h3>
      </div>
    </Link>
  );
}

export default function RecentlyAddedSection() {
  const [pages, setPages] = useState<RecentPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages?sort=recent&pageSize=8')
      .then((r) => r.json())
      .then((data) => setPages(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && pages.length === 0) return null;

  return (
    <section className="relative py-12 sm:py-16 md:py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/4 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-fredoka mb-2">
              New Free Coloring Pages — Just Added
            </h2>
            <p className="text-white/55 font-dm-sans text-base">
              Fresh free printable coloring pages added this week — download as PDF instantly
            </p>
          </div>
          <Link
            href="/free-coloring-pages"
            className="hidden sm:flex items-center gap-1.5 text-sm font-dm-sans text-white/50 hover:text-white transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {pages.map((page) => (
              <RecentCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
