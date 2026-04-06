'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SpotlightPage {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
}

interface Spotlight {
  id: string;
  heading: string;
  category_slug: string;
  pages: SpotlightPage[];
}

const FALLBACK_SPOTLIGHT: Spotlight = {
  id: 'fallback',
  heading: 'Spring Coloring Pages — Just Added',
  category_slug: 'spring',
  pages: [
    { id: '1', title: 'Spring Flowers Coloring Page', slug: 'free-coloring-pages', imageUrl: 'https://placehold.co/300x400/ec4899/ffffff?text=Spring+Flowers' },
    { id: '2', title: 'Easter Bunny Coloring Page', slug: 'free-coloring-pages', imageUrl: 'https://placehold.co/300x400/a855f7/ffffff?text=Easter+Bunny' },
    { id: '3', title: 'Baby Chick Coloring Page', slug: 'free-coloring-pages', imageUrl: 'https://placehold.co/300x400/eab308/ffffff?text=Baby+Chick' },
    { id: '4', title: 'Butterfly Garden Coloring Page', slug: 'free-coloring-pages', imageUrl: 'https://placehold.co/300x400/06b6d4/ffffff?text=Butterfly' },
    { id: '5', title: 'Rainbow Coloring Page', slug: 'free-coloring-pages', imageUrl: 'https://placehold.co/300x400/f97316/ffffff?text=Rainbow' },
    { id: '6', title: 'Ladybug Coloring Page', slug: 'free-coloring-pages', imageUrl: 'https://placehold.co/300x400/dc2626/ffffff?text=Ladybug' },
  ],
};

export default function SeasonalSpotlight() {
  const [spotlight, setSpotlight] = useState<Spotlight | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/seasonal-spotlight')
      .then((r) => r.json())
      .then((data) => setSpotlight(data.spotlight || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayed = spotlight && spotlight.pages.length > 0 ? spotlight : FALLBACK_SPOTLIGHT;

  if (loading) return null;

  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-pink-500/5 to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div>
            {/* Seasonal label */}
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-orange-400 text-lg">✦</span>
              <span className="text-xs font-bold font-dm-sans tracking-widest uppercase text-orange-400/80">
                Seasonal Spotlight
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-fredoka leading-tight">
              {displayed.heading}
            </h2>
          </div>
          <Link
            href={`/${displayed.category_slug}-coloring-pages`}
            className="hidden sm:flex items-center gap-1.5 text-sm font-dm-sans text-white/50 hover:text-white transition-colors shrink-0"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:grid sm:grid-cols-3 lg:grid-cols-6 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-none"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {displayed.pages.map((page) => (
            <Link
              key={page.id}
              href={`/${page.slug}`}
              className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-orange-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 bg-[#12121a] shrink-0 w-40 sm:w-auto"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="relative aspect-[3/4]">
                {page.imageUrl ? (
                  <Image
                    src={page.imageUrl}
                    alt={page.title}
                    fill
                    sizes="(max-width: 640px) 160px, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-2.5">
                <p className="text-white text-xs font-dm-sans line-clamp-2 group-hover:text-orange-300 transition-colors leading-snug">
                  {page.title.replace(/\s+coloring[\s-]page$/i, '').trim()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
