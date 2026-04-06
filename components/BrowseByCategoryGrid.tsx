'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
  count: number;
}

const GRADIENT_PLACEHOLDERS = [
  'from-pink-500 to-rose-600',
  'from-purple-500 to-violet-600',
  'from-cyan-500 to-blue-600',
  'from-orange-500 to-amber-600',
  'from-green-500 to-emerald-600',
  'from-fuchsia-500 to-pink-600',
  'from-indigo-500 to-purple-600',
  'from-teal-500 to-cyan-600',
];

const CATEGORY_ICONS: Record<string, string> = {
  animals: '🦁',
  dinosaur: '🦕',
  unicorn: '🦄',
  princess: '👸',
  halloween: '🎃',
  cars: '🚗',
  cute: '🧸',
  'hello-kitty': '🐱',
  'k-pop': '🎤',
  spring: '🌷',
  summer: '☀️',
};

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const gradient = GRADIENT_PLACEHOLDERS[index % GRADIENT_PLACEHOLDERS.length];
  const icon = CATEGORY_ICONS[category.slug] ?? category.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/${category.slug}-coloring-pages`}
      className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 bg-[#12121a]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {category.thumbnail_url ? (
          <Image
            src={category.thumbnail_url}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-7xl select-none drop-shadow-lg" role="img" aria-label={category.name}>
              {icon}
            </span>
          </div>
        )}
        {/* overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Page count badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold font-dm-sans bg-black/50 backdrop-blur-sm text-white border border-white/20">
          {category.count} pages
        </div>
      </div>

      {/* Card footer */}
      <div className="p-4">
        <h3 className="text-white font-semibold font-fredoka text-lg leading-tight group-hover:text-pink-300 transition-colors">
          {category.name}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-white/50 text-xs font-dm-sans">
          <span>Browse all</span>
          <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export default function BrowseByCategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 animate-pulse aspect-[4/3]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="relative py-12 sm:py-16 md:py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-fredoka mb-4">
            Browse Free Coloring Pages by Category
          </h2>
          <p className="text-white/60 text-base sm:text-lg font-dm-sans max-w-xl mx-auto">
            Animals, K-pop, unicorns, dinosaurs, Halloween & more — free printable coloring pages for kids and adults, organized by theme.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 8).map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/free-coloring-pages"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-dm-sans font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5"
          >
            View All Categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
