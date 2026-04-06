'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Book {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  amazonUrl: string | null;
  status: 'coming_soon' | 'available' | 'out_of_stock';
  sortOrder: number;
  rating?: number | null;
  ratingCount?: number | null;
  tags?: string[];
}

// ─── Accent palette per book index ──────────────────────────────────────────
const ACCENTS = [
  { color: '#ea1974', bg: 'from-pink-600/30 via-rose-500/20 to-pink-900/30' },
  { color: '#bc25c4', bg: 'from-purple-600/30 via-fuchsia-500/20 to-purple-900/30' },
  { color: '#58b7da', bg: 'from-cyan-500/30 via-sky-400/20 to-cyan-900/30' },
  { color: '#f59e0b', bg: 'from-amber-500/30 via-yellow-400/20 to-amber-900/30' },
  { color: '#10b981', bg: 'from-emerald-500/30 via-teal-400/20 to-emerald-900/30' },
  { color: '#f43f5e', bg: 'from-rose-500/30 via-pink-400/20 to-rose-900/30' },
];

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const SparkleIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
  </svg>
);

const PaintBrushIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M36 4 L44 12 L18 38 L8 40 L10 30 Z" />
    <path d="M28 12 L36 20" />
    <circle cx="9" cy="39" r="4" fill="currentColor" opacity="0.4" />
  </svg>
);

const BookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="6" width="38" height="52" rx="3" />
    <path d="M8 6 C8 6 14 10 14 32 C14 54 8 58 8 58" opacity="0.5" />
    <path d="M46 6 L54 10 L54 58 L46 58" />
    <line x1="18" y1="20" x2="40" y2="20" /><line x1="18" y1="28" x2="40" y2="28" /><line x1="18" y1="36" x2="32" y2="36" />
  </svg>
);

const PaintDropIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 4 C16 4 6 16 6 22 C6 27.5 10.5 32 16 32 C21.5 32 26 27.5 26 22 C26 16 16 4 16 4Z" />
  </svg>
);

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= full
                ? 'text-amber-400'
                : s === full + 1 && half
                ? 'text-amber-400/60'
                : 'text-white/20'
            }`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      {count > 0 ? (
        <span className="text-xs text-white/45 font-dm-sans">
          {rating.toFixed(1)}{' '}
          <span className="text-white/30">({count.toLocaleString()} Flipkart ratings)</span>
        </span>
      ) : (
        <span className="text-xs text-white/25 font-dm-sans italic">Rating coming soon</span>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Book['status'] }) {
  if (status === 'available') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-dm-sans bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Available Now
      </span>
    );
  }
  if (status === 'coming_soon') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-dm-sans bg-amber-500/15 text-amber-300 border border-amber-500/25">
        <SparkleIcon className="w-3 h-3" />
        Coming Soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-dm-sans bg-white/5 text-white/40 border border-white/10">
      <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
      Out of Stock
    </span>
  );
}

// ─── Book Row Card ────────────────────────────────────────────────────────────

function BookRow({ book, index }: { book: Book; index: number }) {
  const [imgError, setImgError] = useState(false);
  const accent = ACCENTS[index % ACCENTS.length];
  const showPlaceholder = !book.imageUrl || imgError;

  return (
    <article
      className="group relative flex flex-col sm:flex-row bg-[#1a1a24] rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:border-white/20"
      style={{
        animation: `rowFadeIn 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 0.1}s both`,
        boxShadow: '0 2px 20px rgba(0,0,0,0.45)',
      }}
    >
      {/* Left vertical paint-stroke accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] z-10 rounded-l-2xl"
        style={{ background: `linear-gradient(to bottom, transparent, ${accent.color}, transparent)` }}
      />

      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ boxShadow: `inset 0 0 80px 0 ${accent.color}10` }}
      />

      {/* ── Image Panel ────────────────────────────────────── */}
      <div
        className="relative flex-shrink-0 w-full sm:w-[200px] md:w-[220px] overflow-hidden"
        style={{ minHeight: '220px' }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${accent.bg}`} />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '18px 18px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none z-10" />

        {showPlaceholder ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20">
            <BookIcon className="w-16 h-16 text-white/30" />
            <span className="text-white/20 text-[10px] tracking-widest uppercase font-dm-sans">No Cover</span>
          </div>
        ) : (
          <div className="absolute inset-3 z-20 transition-transform duration-500 group-hover:scale-105">
            <Image
              src={book.imageUrl!}
              alt={`${book.title} – Coloring Book for Kids & Adults Cover`}
              fill
              sizes="220px"
              className="object-contain drop-shadow-2xl"
              onError={() => setImgError(true)}
            />
          </div>
        )}
      </div>

      {/* ── Content Panel ──────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-6 py-5 gap-3 min-w-0">

        {/* Top row: badge + index number */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <StatusBadge status={book.status} />
          <span
            className="text-xs font-mono tabular-nums font-dm-sans select-none"
            style={{ color: `${accent.color}60` }}
          >
            #{String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight font-fredoka">
          {book.title}
        </h2>

        {/* Star Rating */}
        <StarRating
          rating={book.rating ?? 0}
          count={book.ratingCount ?? 0}
        />

        {/* Audience / Category Tags */}
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {book.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-dm-sans font-medium border border-white/10 bg-white/5 text-white/50 capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Decorative rule */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${accent.color}50, transparent)` }} />
          <SparkleIcon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: `${accent.color}80` }} />
        </div>

        {/* Description — full, no clamp */}
        {book.description ? (
          <p className="text-xs text-white/65 leading-relaxed font-dm-sans">
            {book.description}
          </p>
        ) : (
          <p className="text-sm text-white/30 italic font-dm-sans">No description available.</p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Button */}
        <div className="pt-1">
          {book.amazonUrl && book.status === 'available' ? (
            <a
              href={book.amazonUrl}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="group/btn relative inline-block"
            >
              {/* Paint-swatch depth layers */}
              <div
                className="absolute -inset-0.5 translate-x-[7px] translate-y-[7px] rounded-xl opacity-60 transition-all duration-500 group-hover/btn:translate-x-2.5 group-hover/btn:translate-y-2.5"
                style={{ background: '#58b7da', clipPath: 'polygon(1% 8%, 100% 2%, 98% 94%, 1% 98%)' }}
              />
              <div
                className="absolute -inset-0.5 translate-x-[4px] translate-y-[4px] rounded-xl opacity-75 transition-all duration-400 group-hover/btn:translate-x-[6px] group-hover/btn:translate-y-[6px]"
                style={{ background: '#E83C91', clipPath: 'polygon(0% 6%, 98% 4%, 99% 94%, 1% 97%)' }}
              />
              <div
                className="relative px-6 py-2.5 rounded-xl overflow-hidden transition-all duration-300 group-hover/btn:scale-[1.02] group-hover/btn:-rotate-[0.5deg]"
                style={{
                  background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)',
                  clipPath: 'polygon(1% 5%, 99% 0%, 98% 95%, 0% 92%)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  }}
                />
                <span className="relative flex items-center gap-2.5 font-bold text-white text-sm tracking-wide font-fredoka">
                  <svg className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover/btn:-rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="rgba(255,255,255,0.25)" />
                  </svg>
                  Get on Flipkart
                  <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          ) : book.status === 'coming_soon' ? (
            <button
              disabled
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-amber-500/25 bg-amber-500/8 text-amber-300/60 text-sm font-semibold font-fredoka cursor-default"
            >
              <SparkleIcon className="w-3.5 h-3.5 animate-pulse" />
              Coming Soon — Stay Tuned
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/8 bg-white/4 text-white/25 text-sm font-semibold font-fredoka">
              Currently Unavailable
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Filter Tabs (Status) ─────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { key: 'all',          label: 'All Books'      },
  { key: 'available',    label: 'Available Now'  },
  { key: 'coming_soon',  label: 'Coming Soon'    },
  { key: 'out_of_stock', label: 'Out of Stock'   },
] as const;
type StatusFilterKey = typeof STATUS_FILTERS[number]['key'];

// ─── Category / Audience Tag Filters ─────────────────────────────────────────

const CATEGORY_TAGS = [
  { key: 'all',      label: 'All',      icon: '✦' },
  { key: 'kids',     label: 'Kids',     icon: '🎨' },
  { key: 'adults',   label: 'Adults',   icon: '🖌️' },
  { key: 'mandala',  label: 'Mandala',  icon: '◎' },
  { key: 'animals',  label: 'Animals',  icon: '🐾' },
  { key: 'fantasy',  label: 'Fantasy',  icon: '✨' },
  { key: 'nature',   label: 'Nature',   icon: '🌿' },
  { key: 'abstract', label: 'Abstract', icon: '◈' },
] as const;
type CategoryKey = typeof CATEGORY_TAGS[number]['key'];

// ─── About This Collection ────────────────────────────────────────────────────

function AboutCollection() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
      <div
        className="relative bg-[#1a1a24] rounded-2xl border border-white/10 p-8 md:p-10 overflow-hidden"
        style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
      >
        {/* Left accent line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
          style={{ background: 'linear-gradient(to bottom, transparent, #ea1974, #bc25c4, transparent)' }}
        />

        {/* Corner sparkle */}
        <SparkleIcon className="absolute top-5 right-6 w-5 h-5 text-amber-400/25" />

        <h2 className="text-2xl md:text-3xl font-bold font-fredoka text-white mb-6">
          How We Choose Our Coloring Books
        </h2>

        <div className="space-y-4 text-white/65 font-dm-sans leading-relaxed text-sm md:text-base">
          <p>
            Every coloring book in our collection is hand-selected by our editorial team based on three
            core criteria: illustration quality, page count, and binding. We only feature books with
            clean, high-contrast line art printed on single-sided pages — ideal for markers, colored
            pencils, and watercolors without bleed-through. {/* TODO: SEO content writer to expand */}
          </p>
          <p>
            We curate books across every age group and skill level, from simple animal outlines for
            young children to intricate geometric mandalas for adults seeking mindful creativity. Each
            listing includes a recommended age range and skill level so you can find the perfect book
            for yourself or as a gift. {/* TODO: SEO content writer to expand */}
          </p>
          <p>
            All books in our collection are available on Amazon, where you benefit from fast shipping,
            easy returns, and verified customer reviews. As an Amazon affiliate, we earn a small
            commission on qualifying purchases at no extra cost to you — this helps us maintain the
            site and keep our free coloring pages library growing. {/* TODO: SEO content writer to expand */}
          </p>
        </div>

        {/* Keyword tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            'Premium Coloring Books',
            'Single-Sided Pages',
            'High-Quality Illustrations',
            'Best Coloring Books for Kids',
            'Adult Coloring Books',
            'Curated Collection',
          ].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-dm-sans border border-white/10 bg-white/5 text-white/40"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Free Coloring Pages Callout ──────────────────────────────────────────────

const MOSAIC_COLORS = [
  '#ea1974', '#f97316', '#f59e0b', '#10b981',
  '#58b7da', '#bc25c4', '#f43f5e', '#a78bfa',
  '#34d399', '#fb923c', '#60a5fa', '#f472b6',
  '#4ade80', '#c084fc', '#38bdf8', '#fbbf24',
  '#e879f9', '#2dd4bf', '#fb7185', '#818cf8',
];

const STRIP_COLORS = ['#ea1974', '#f97316', '#f59e0b', '#10b981', '#58b7da', '#bc25c4'];

function FreeColorsCallout() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: '#13131d',
          boxShadow: '0 4px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Rainbow paint-strip — left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-[5px] flex flex-col z-10">
          {STRIP_COLORS.map((c, i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>

        {/* Diagonal wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(122deg, rgba(234,25,116,0.07) 0%, transparent 48%, rgba(88,183,218,0.05) 100%)',
          }}
        />

        {/* Ambient glows */}
        <div
          className="absolute -top-16 -left-8 w-72 h-72 rounded-full blur-3xl opacity-[0.14] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #ea1974, transparent 60%)' }}
        />
        <div
          className="absolute -bottom-16 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-[0.10] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #58b7da, transparent 60%)' }}
        />

        {/* Content */}
        <div className="flex flex-col sm:flex-row items-center gap-8 pl-10 pr-8 py-10 md:py-12">

          {/* ── Left: text + CTA ── */}
          <div className="flex-1 min-w-0">

            {/* FREE badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase mb-5"
              style={{
                background: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.28)',
                color: '#34d399',
                fontFamily: "'Fredoka', sans-serif",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Free · No Purchase Needed
            </div>

            {/* Oversized counter + label */}
            <div className="flex items-end gap-4 mb-5">
              <span
                className="font-fredoka font-bold leading-[0.88] text-transparent bg-clip-text select-none"
                style={{
                  fontSize: 'clamp(3.8rem, 9vw, 5.5rem)',
                  backgroundImage: 'linear-gradient(135deg, #ea1974 0%, #bc25c4 45%, #58b7da 100%)',
                }}
              >
                300+
              </span>
              <div className="pb-2 flex flex-col">
                <span
                  className="text-white font-fredoka font-semibold leading-tight"
                  style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)' }}
                >
                  Free
                </span>
                <span
                  className="text-white/55 font-fredoka leading-tight"
                  style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}
                >
                  Coloring Sheets
                </span>
              </div>
            </div>

            <p className="text-white/38 font-dm-sans text-sm leading-relaxed mb-8 max-w-xs">
              Download, print, and color — no account, no checkout, no catch.
              New pages added every week.
            </p>

            {/* CTA — paint-swatch depth style */}
            <Link href="/free-coloring-pages" className="group/cta relative inline-block">
              <div
                className="absolute -inset-0.5 translate-x-[7px] translate-y-[7px] rounded-xl opacity-50 transition-all duration-500 group-hover/cta:translate-x-[10px] group-hover/cta:translate-y-[10px]"
                style={{ background: '#58b7da', clipPath: 'polygon(1% 8%, 100% 2%, 98% 94%, 1% 98%)' }}
              />
              <div
                className="absolute -inset-0.5 translate-x-[3px] translate-y-[3px] rounded-xl opacity-70 transition-all duration-300 group-hover/cta:translate-x-[5px] group-hover/cta:translate-y-[5px]"
                style={{ background: '#ea1974', clipPath: 'polygon(0% 6%, 98% 4%, 99% 94%, 1% 97%)' }}
              />
              <div
                className="relative px-7 py-3 rounded-xl overflow-hidden transition-all duration-300 group-hover/cta:scale-[1.02] group-hover/cta:-rotate-[0.4deg]"
                style={{
                  background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)',
                  clipPath: 'polygon(1% 5%, 99% 0%, 98% 95%, 0% 92%)',
                }}
              >
                <span className="relative flex items-center gap-2.5 font-bold text-white text-sm tracking-wide font-fredoka">
                  Browse Free Coloring Pages
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover/cta:translate-x-1"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>

          {/* ── Right: colour mosaic ── */}
          <div
            className="flex-shrink-0 hidden sm:flex flex-col gap-2 self-center pr-2"
            aria-hidden="true"
          >
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="flex gap-2">
                {[0, 1, 2, 3].map((col) => {
                  const idx = row * 4 + col;
                  const rot = ((idx * 11) % 14) - 7;
                  return (
                    <div
                      key={col}
                      className="w-10 h-[52px] rounded-lg transition-all duration-500 hover:scale-110 hover:-translate-y-1"
                      style={{
                        background: `linear-gradient(150deg, ${MOSAIC_COLORS[idx]}d0, ${MOSAIC_COLORS[idx]}70)`,
                        transform: `rotate(${rot}deg)`,
                        boxShadow: `0 3px 10px ${MOSAIC_COLORS[idx]}35`,
                        border: '1px solid rgba(255,255,255,0.09)',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Are these coloring books available as printable PDFs?',
    a: 'Our coloring books are physical and digital books sold on Amazon — not downloadable PDFs. For free printable coloring pages you can download and print at home, visit our Free Coloring Pages section.',
  },
  {
    q: 'What is the best coloring book for beginners?',
    a: 'For beginners, we recommend books with larger designs, simple outlines, and fewer intricate details. Browse our collection and look for books labeled for kids or beginner-friendly — more detailed descriptions are being added shortly.', // TODO: SEO writer to expand
  },
  {
    q: 'Are these coloring books suitable for adults?',
    a: 'Absolutely! Our collection includes dedicated adult coloring books featuring intricate mandalas, nature patterns, and detailed illustrations designed for stress relief and mindfulness. Each book listing notes its recommended audience.', // TODO: SEO writer to expand
  },
  {
    q: 'What age are these coloring books recommended for?',
    a: 'We have books for all ages — from simple designs for toddlers and young children (ages 3–6) to complex patterns for teens and adults. Age recommendations are included in each book\'s description.', // TODO: SEO writer to expand
  },
  {
    q: 'Why do you link to Amazon instead of selling directly?',
    a: 'We partner with Amazon so you benefit from their trusted purchasing experience, fast shipping, easy returns, and customer reviews. We focus on hand-picking the best books; Amazon handles fulfillment and support.', // TODO: SEO writer to expand
  },
  {
    q: 'How often do you add new coloring books to the collection?',
    a: 'We review our collection regularly and add new titles as we discover high-quality books that meet our curation standards. New books are typically added monthly — check back often for updates.', // TODO: SEO writer to expand
  },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
      {/* Section header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/40 font-dm-sans tracking-widest uppercase mb-5">
          <SparkleIcon className="w-3 h-3 text-cyan-400" />
          FAQ
        </div>
        <h2 className="text-3xl md:text-4xl font-bold font-fredoka text-white mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-white/40 font-dm-sans text-sm max-w-md mx-auto">
          Everything you need to know about our coloring book collection.
        </p>
        {/* Paint-stroke underline */}
        <div className="mt-4 flex justify-center">
          <svg viewBox="0 0 200 10" className="w-40 h-2.5 opacity-40" preserveAspectRatio="none">
            <path
              d="M3,5 Q18,2 33,6 T63,4 T93,7 T123,3 T153,6 Q173,5 197,5"
              fill="none"
              stroke="url(#faq-sg)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="faq-sg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ea1974" />
                <stop offset="50%" stopColor="#bc25c4" />
                <stop offset="100%" stopColor="#58b7da" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className="bg-[#1a1a24] rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/15"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          >
            <button
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors duration-200"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              aria-expanded={openIdx === i}
            >
              <span className="font-semibold text-white font-fredoka text-base md:text-lg pr-4">
                {item.q}
              </span>
              <svg
                className={`w-5 h-5 text-white/35 flex-shrink-0 transition-transform duration-300 ${
                  openIdx === i ? 'rotate-180' : ''
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIdx === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-5 pt-1 border-t border-white/5">
                <p className="text-white/55 font-dm-sans text-sm md:text-base leading-relaxed pt-3">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 px-4 text-center">
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
          <PaintBrushIcon className="w-14 h-14 text-white/30" />
        </div>
        <SparkleIcon className="absolute -top-2 -right-2 w-6 h-6 text-amber-400/60 animate-pulse" />
        <PaintDropIcon className="absolute -bottom-2 -left-2 w-5 h-5 text-pink-500/50" />
      </div>
      <h3 className="text-2xl font-bold text-white font-fredoka mb-3">We&apos;re working on something amazing!</h3>
      <p className="text-white/45 font-dm-sans max-w-sm leading-relaxed text-sm">
        Our coloring books collection is coming soon. Check back shortly for beautifully illustrated books for all ages.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ColoringBooksGrid({ books }: { books: Book[] }) {
  const [activeStatus, setActiveStatus] = useState<StatusFilterKey>('all');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  const filtered = books
    .filter((b) => activeStatus === 'all' || b.status === activeStatus)
    .filter((b) => activeCategory === 'all' || (b.tags ?? []).includes(activeCategory));

  const statusCounts: Record<StatusFilterKey, number> = {
    all:          books.length,
    available:    books.filter((b) => b.status === 'available').length,
    coming_soon:  books.filter((b) => b.status === 'coming_soon').length,
    out_of_stock: books.filter((b) => b.status === 'out_of_stock').length,
  };

  return (
    <>
      <style>{`
        @keyframes rowFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-16px) scale(1.03); }
        }
        @keyframes brushDrift {
          0%,100% { transform: translateY(0) rotate(-12deg); }
          50%      { transform: translateY(-10px) rotate(-7deg); }
        }
        @keyframes brushDriftR {
          0%,100% { transform: translateY(0) rotate(14deg); }
          50%      { transform: translateY(-13px) rotate(19deg); }
        }
      `}</style>

      <main className="min-h-screen bg-[#0a0a0f]">

        {/* ── Hero Header ───────────────────────────────────────────── */}
        <section className="relative pt-10 pb-14 overflow-hidden">

          {/* Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle, #ea197445, transparent 70%)', animation: 'orbFloat 7s ease-in-out infinite' }} />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-15"
            style={{ background: 'radial-gradient(circle, #58b7da45, transparent 70%)', animation: 'orbFloat 9s ease-in-out infinite reverse' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-8"
            style={{ background: 'radial-gradient(circle, #bc25c430, transparent 70%)' }} />

          {/* Floating brushes */}
          <div className="absolute top-10 left-[7%] text-pink-400/25 hidden md:block" style={{ animation: 'brushDrift 5s ease-in-out infinite' }}>
            <PaintBrushIcon className="w-16 h-16" />
          </div>
          <div className="absolute top-8 right-[7%] text-cyan-400/20 hidden md:block" style={{ animation: 'brushDriftR 6s ease-in-out infinite' }}>
            <PaintBrushIcon className="w-12 h-12" />
          </div>
          <SparkleIcon className="absolute top-14 right-[22%] w-5 h-5 text-amber-400/45 hidden lg:block animate-pulse" />
          <SparkleIcon className="absolute bottom-6 left-[17%] w-4 h-4 text-pink-400/35 hidden lg:block animate-pulse" style={{ animationDelay: '0.7s' }} />
          <PaintDropIcon className="absolute bottom-3 right-[11%] w-5 h-5 text-purple-400/25 hidden lg:block" style={{ animation: 'brushDrift 4s ease-in-out infinite 1s' }} />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center" style={{ animation: 'heroDown 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-sm text-white/35 font-dm-sans mb-8">
              <Link href="/" className="hover:text-white/65 transition-colors duration-200">Home</Link>
              <svg className="w-3 h-3 opacity-40" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
              <span className="text-white/55">Coloring Books</span>
            </nav>

            {/* Pill badge */}
            {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-white/45 font-dm-sans tracking-widest uppercase mb-6">
              <SparkleIcon className="w-3 h-3 text-amber-400" />
              Hand-Picked Collection
              <SparkleIcon className="w-3 h-3 text-cyan-400" />
            </div> */}

            {/* H1 — updated with audience qualifier */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-fredoka leading-none mb-5">
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(110deg, #ea1974, #bc25c4 45%, #58b7da)' }}>
                Coloring Books
              </span>
              <br />
              <span className="text-2xl sm:text-3xl md:text-4xl text-white/70 font-fredoka font-semibold">
                for Kids &amp; Adults
              </span>
            </h1>

            {/* Hero subtext — updated for book purchase flow */}
            <p className="text-sm sm:text-base text-white/55 mx-auto font-dm-sans leading-relaxed">
              Discover our curated collection of coloring books for kids and adults —{' '}
              <span className="text-white/80">all available on Amazon.</span>{' '}
              <br></br>
              Hand-selected for illustration quality and suitability for every age group. New books added regularly.
            </p>

            {/* Paint-stroke underline */}
            <div className="mt-5 flex justify-center">
              <svg viewBox="0 0 280 12" className="w-56 h-3 opacity-45" preserveAspectRatio="none">
                <path d="M4,6 Q24,2 44,7 T84,4 T124,8 T164,3 T204,7 Q234,5 276,5"
                  fill="none" stroke="url(#sg)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ea1974" />
                    <stop offset="50%" stopColor="#bc25c4" />
                    <stop offset="100%" stopColor="#58b7da" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Last Updated date signal */}
            {/* <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/30 font-dm-sans">
              <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <time dateTime="2026-03">Last updated: March 2026</time>
            </div> */}
          </div>
        </section>

        {/* ── Category / Audience Filters ──────────────────────────── */}
        {/* <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-4">
          <p className="text-[11px] text-white/30 font-dm-sans uppercase tracking-widest mb-3">Browse by audience</p>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_TAGS.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold font-dm-sans
                    border transition-all duration-300
                    ${active
                      ? 'text-white border-white/20'
                      : 'text-white/45 border-white/8 bg-white/4 hover:bg-white/8 hover:text-white/70'
                    }`}
                  style={
                    active
                      ? {
                          background: 'linear-gradient(110deg,#ea197415,#bc25c415,#58b7da15)',
                          borderColor: 'rgba(188,37,196,0.35)',
                        }
                      : {}
                  }
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section> */}

        {/* ── Status Filter Tabs ────────────────────────────────────── */}
        {books.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
            <p className="text-[11px] text-white/30 font-dm-sans uppercase tracking-widest mb-3">Filter by availability</p>
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((f) => {
                const active = activeStatus === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveStatus(f.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-dm-sans
                      border transition-all duration-300
                      ${active
                        ? 'text-white border-white/20'
                        : 'text-white/45 border-white/8 bg-white/4 hover:bg-white/8 hover:text-white/70'
                      }`}
                    style={
                      active
                        ? {
                            background: 'linear-gradient(110deg,#ea197415,#bc25c415,#58b7da15)',
                            borderColor: 'rgba(188,37,196,0.35)',
                          }
                        : {}
                    }
                  >
                    {f.label}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                        active ? 'bg-white/20 text-white' : 'bg-white/8 text-white/35'
                      }`}
                    >
                      {statusCounts[f.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Book List ────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-5">
              {filtered.map((book, i) => (
                <BookRow key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ── About This Collection ─────────────────────────────────── */}
        <AboutCollection />

        {/* ── Free Coloring Pages Callout ───────────────────────────── */}
        <FreeColorsCallout />

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <FAQSection />

      </main>
    </>
  );
}
