'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { SinglePageResponse } from '@/app/api/pages/[slug]/route';
import { event as gaEvent } from '@/lib/gtag';
import AdUnit from '@/components/AdUnit';

type ColorType = 'bw' | 'color';
type FormatType = 'jpeg' | 'pdf';

interface RelatedPage {
  id: string;
  title: string;
  slug: string;
  bwPreview: string | null;
  categoryName: string | null;
}

interface ColoringPageClientProps {
  pageData: SinglePageResponse;
  slug: string;
  displayTitle: string;
}

const PRINTING_TIPS_FALLBACK = (difficulty: string | null) =>
  `Print on standard 8.5×11" letter-size paper at 100% scale (do not scale to fit). For best results, use a laser or inkjet printer on bright white paper. If printing for young children, try cardstock for durability. ${
    difficulty === 'Easy'
      ? 'Crayons or colored pencils work great for this simple design.'
      : difficulty === 'Hard'
      ? 'Fine-tipped markers or colored pencils work best for the intricate details.'
      : 'Colored pencils or markers both work well for this design.'
  }`;

export default function ColoringPageClient({ pageData, slug, displayTitle }: ColoringPageClientProps) {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') === 'color' ? 'color' : 'bw';

  const [selectedColor, setSelectedColor] = useState<ColorType>(initialType);
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('jpeg');
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPinHovered, setIsPinHovered] = useState<number | null>(null);

  // Rating state
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [ratingSum, setRatingSum] = useState(pageData.ratingSum);
  const [ratingCount, setRatingCount] = useState(pageData.ratingCount);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  // Related pages state
  const [relatedPages, setRelatedPages] = useState<RelatedPage[]>([]);

  // Check if user already voted (localStorage)
  useEffect(() => {
    const voted = localStorage.getItem(`voted-${pageData.id}`);
    if (voted) {
      setHasVoted(true);
      setSelectedRating(Number(voted));
    }
  }, [pageData.id]);

  // Fetch related pages on mount
  useEffect(() => {
    fetch(`/api/pages/${slug}/related?limit=6`)
      .then(r => r.ok ? r.json() : { pages: [] })
      .then(data => setRelatedPages(data.pages ?? []))
      .catch(() => {});
  }, [slug]);

  // Get assets for the selected mode
  const selectedAsset = pageData.assets.find(asset => asset.mode === selectedColor);
  const bwAsset = pageData.assets.find(asset => asset.mode === 'bw');
  const colorAsset = pageData.assets.find(asset => asset.mode === 'color');

  const getDownloadUrl = () => {
    if (!selectedAsset) return null;
    return selectedFormat === 'jpeg' ? selectedAsset.jpegUrl : selectedAsset.pdfUrl;
  };

  const handleDownload = () => {
    if (!getDownloadUrl()) {
      alert('Download not available for this format');
      return;
    }
    gaEvent('coloring_page_download', {
      page_title: pageData.title,
      page_slug: pageData.slug,
      format: selectedFormat,
      color_mode: selectedColor,
    });
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = `/api/download/${pageData.id}?format=${selectedFormat}&mode=${selectedColor}`;
    link.download = `${displayTitle.toLowerCase().replace(/\s+/g, '-')}-${selectedColor}.${selectedFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const handleRating = async (star: number) => {
    if (hasVoted) return;
    setSelectedRating(star);
    setHasVoted(true);
    setRatingMessage(null);

    try {
      const res = await fetch(`/api/pages/${slug}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: star }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setRatingMessage('You have already rated this page.');
      } else if (res.ok) {
        localStorage.setItem(`voted-${pageData.id}`, String(star));
        setRatingSum(Math.round(data.ratingValue * data.reviewCount));
        setRatingCount(data.reviewCount);
        setRatingMessage('Thank you for your rating!');
        gaEvent('page_rating_submit', { page_slug: pageData.slug, rating_value: star });
      }
    } catch {
      setRatingMessage('Could not save rating. Please try again.');
      setHasVoted(false);
      setSelectedRating(null);
    }
  };

  const currentRatingValue =
    ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0;

  const categoryColor = '#ea1974';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pageUrl = `${baseUrl}/${slug}`;
  const bwThumbnailUrl = bwAsset?.thumbnailUrl ?? bwAsset?.jpegUrl ?? '';

  const pinterestUrl = bwThumbnailUrl
    ? `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(bwThumbnailUrl)}&description=${encodeURIComponent(`${displayTitle} Coloring Page - Free Printable`)}`
    : null;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Free ${displayTitle} Coloring Page — download and print for free!`)}&url=${encodeURIComponent(pageUrl)}`;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Gochi+Hand&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes scribble {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .handwritten {
          font-family: 'Gochi Hand', cursive;
        }

        .paper-texture {
          background-image:
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E");
        }

        .sticker {
          position: relative;
          filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3));
        }

        .sticker::before {
          content: '';
          position: absolute;
          inset: 4px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%);
          pointer-events: none;
        }

        .star-btn {
          transition: transform 0.15s ease;
        }
        .star-btn:hover:not(:disabled) {
          transform: scale(1.15);
        }
      `}</style>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}/>
        <div className="absolute top-20 left-10 opacity-10" style={{ animation: 'float 6s ease-in-out infinite' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#ea1974]">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div className="absolute top-40 right-20 opacity-10" style={{ animation: 'float 8s ease-in-out infinite 1s' }}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#58b7da]">
            <circle cx="12" cy="12" r="3" strokeWidth={1.5}/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
          </svg>
        </div>
        <div className="absolute bottom-32 left-1/4 opacity-10" style={{ animation: 'float 7s ease-in-out infinite 2s' }}>
          <svg width="55" height="55" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#bc25c4]">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="relative py-8 sm:py-12">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

            {/* Left Side - Pinned Paper Image */}
            <div className="relative">
              <div className="lg:sticky lg:top-24">
                {/* Main image - pinned paper effect */}
                <div
                  className="relative group"
                  style={{
                    transform: 'rotate(-1.5deg)',
                    transformOrigin: 'top center',
                    animation: 'wiggle 8s ease-in-out infinite',
                  }}
                >
                  {/* Push pins */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex gap-12">
                    {[0, 1].map((pinIndex) => (
                      <button
                        key={pinIndex}
                        onMouseEnter={() => setIsPinHovered(pinIndex)}
                        onMouseLeave={() => setIsPinHovered(null)}
                        className="relative w-8 h-8 transition-transform duration-200 hover:scale-110"
                        style={{
                          transform: isPinHovered === pinIndex ? 'translateY(-2px)' : 'translateY(0)',
                        }}
                      >
                        <div className="absolute inset-0 rounded-full blur-md opacity-40"
                          style={{ background: pinIndex === 0 ? '#ef4444' : '#3b82f6' }}/>
                        <div
                          className="relative w-8 h-8 rounded-full shadow-lg sticker"
                          style={{
                            background: pinIndex === 0
                              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                              : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          }}
                        >
                          <div className="absolute inset-2 rounded-full bg-white/30"/>
                        </div>
                        <div
                          className="absolute left-1/2 top-6 w-0.5 h-6 -translate-x-1/2"
                          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1))' }}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Paper card */}
                  <div
                    className="relative bg-[#FFFEF8] rounded-lg shadow-2xl overflow-hidden paper-texture"
                    style={{ boxShadow: '8px 12px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}
                  >
                    {/* Washi tape top */}
                    <div className="absolute top-0 left-0 right-0 h-6 z-20 overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-80"
                        style={{
                          background: `repeating-linear-gradient(45deg, ${categoryColor}, ${categoryColor} 10px, transparent 10px, transparent 20px), ${categoryColor}`,
                          boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.3) 1px, rgba(255,255,255,0.3) 2px)' }}
                      />
                    </div>

                    {/* Image container */}
                    <div className="relative aspect-[3/4] p-6 pt-10">
                      <div className="relative w-full h-full rounded border-4 border-white shadow-inner overflow-hidden">
                        {!imageLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div
                              className="w-12 h-12 border-4 border-transparent rounded-full"
                              style={{ borderTopColor: categoryColor, animation: 'spin-slow 1s linear infinite' }}
                            />
                          </div>
                        )}
                        {(selectedAsset?.jpegUrl ?? selectedAsset?.thumbnailUrl) && (
                          <Image
                            src={selectedAsset.jpegUrl ?? selectedAsset.thumbnailUrl!}
                            alt={`${displayTitle} - ${selectedColor === 'bw' ? 'Black and White' : 'Color'} Coloring Page`}
                            fill
                            className={`object-contain transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                            priority
                            onLoad={() => setImageLoaded(true)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Bottom info strip */}
                    <div
                      className="relative px-6 py-4 border-t-4"
                      style={{ borderColor: categoryColor, background: 'linear-gradient(180deg, #F8F6F1 0%, #F3F0E8 100%)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold">HD</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span className="font-semibold">Print</span>
                          </div>
                        </div>
                        <div
                          className="sticker px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{
                            background: selectedColor === 'bw'
                              ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                              : 'linear-gradient(135deg, #ea1974, #bc25c4)',
                          }}
                        >
                          {selectedColor === 'bw' ? 'B&W' : 'COLOR'}
                        </div>
                      </div>
                    </div>

                    {/* Paper fold corner */}
                    <div
                      className="absolute bottom-0 right-0 w-16 h-16"
                      style={{
                        background: 'linear-gradient(135deg, transparent 50%, #E8E4DB 50%, #DDD8CC 100%)',
                        boxShadow: '-2px -2px 6px rgba(0, 0, 0, 0.15)',
                      }}
                    />
                  </div>
                </div>

                {/* Thumbnail selector */}
                <div className="flex gap-3 mt-6 justify-center">
                  {(['bw', 'color'] as ColorType[]).map((type, idx) => {
                    const asset = type === 'bw' ? bwAsset : colorAsset;
                    if (!asset?.thumbnailUrl) return null;
                    return (
                      <button
                        key={type}
                        onClick={() => { setSelectedColor(type); setImageLoaded(false); gaEvent('color_mode_toggle', { mode: type }); }}
                        className={`relative group transition-all duration-300 ${selectedColor === type ? 'scale-110' : 'hover:scale-105'}`}
                        style={{ transform: `rotate(${idx === 0 ? -3 : 3}deg)` }}
                      >
                        <div
                          className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-4 opacity-80 -z-10"
                          style={{
                            background: type === 'bw'
                              ? 'repeating-linear-gradient(45deg, #94a3b8, #94a3b8 8px, transparent 8px, transparent 16px), #94a3b8'
                              : 'repeating-linear-gradient(45deg, #f472b6, #f472b6 8px, transparent 8px, transparent 16px), #f472b6',
                            boxShadow: 'inset 0 -1px 2px rgba(0, 0, 0, 0.2)',
                          }}
                        />
                        <div
                          className={`relative w-20 h-16 rounded-lg overflow-hidden bg-white shadow-lg border-4 transition-all duration-300 ${
                            selectedColor === type ? 'border-white ring-4' : 'border-gray-200'
                          }`}
                          style={{ ['--tw-ring-color' as string]: type === 'bw' ? '#6b7280' : '#ea1974' }}
                        >
                          <Image src={asset.thumbnailUrl} alt={type === 'bw' ? 'Black and White' : 'Color'} fill className="object-cover" />
                          {selectedColor === type && (
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 flex items-center justify-center">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center sticker"
                                style={{ background: type === 'bw' ? 'linear-gradient(135deg, #6b7280, #4b5563)' : 'linear-gradient(135deg, #ea1974, #bc25c4)' }}
                              >
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className="flex flex-col">

              {/* ── Breadcrumb ── */}
              <nav aria-label="Breadcrumb" className="mb-4 text-xs text-white/40 font-dm-sans flex flex-wrap items-center gap-1">
                <Link href="/" className="hover:text-[#ea1974] transition-colors">Home</Link>
                <span>/</span>
                <Link href="/free-coloring-pages" className="hover:text-[#ea1974] transition-colors">Free Coloring Pages</Link>
                {pageData.categoryName && pageData.categorySlug && (
                  <>
                    <span>/</span>
                    <Link href={`/${pageData.categorySlug}-coloring-pages`} className="hover:text-[#ea1974] transition-colors">
                      {pageData.categoryName} Coloring Pages
                    </Link>
                  </>
                )}
                <span>/</span>
                <span className="text-white/60">{displayTitle} Coloring Page</span>
              </nav>

              {/* Title & Category Tags */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-1 rounded-full bg-[#ea1974] opacity-70" style={{ transform: 'rotate(-2deg)' }} />
                  <div className="w-5 h-1 rounded-full bg-[#bc25c4] opacity-60" />
                  <div className="w-6 h-1 rounded-full bg-[#58b7da] opacity-65" style={{ transform: 'rotate(2deg)' }} />
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-fredoka text-white mb-4">
                  {displayTitle} Coloring Page
                </h1>

                {/* Category tags → clickable links */}
                {pageData.possibleCategories && pageData.possibleCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pageData.possibleCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/${cat.slug}-coloring-pages`}
                        className="px-3 py-1 rounded-full text-xs font-bold text-white border-2 hover:scale-110 transition-all duration-200"
                        style={{
                          background: `linear-gradient(135deg, ${categoryColor}dd, ${categoryColor})`,
                          borderColor: categoryColor,
                          boxShadow: `0 2px 8px ${categoryColor}40`,
                        }}
                      >
                        {cat.name} Coloring Pages
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${
                    pageData.difficulty === 'Easy' ? 'from-green-500 to-emerald-500' :
                    pageData.difficulty === 'Medium' ? 'from-yellow-500 to-orange-500' :
                    'from-red-500 to-pink-500'
                  } mb-2`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-xs text-white/50 font-dm-sans mb-1">Difficulty</p>
                  <p className="text-sm font-semibold text-white">{pageData.difficulty || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#ea1974] to-[#bc25c4] mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-white/50 font-dm-sans mb-1">Age Range</p>
                  <p className="text-sm font-semibold text-white">{pageData.ageRange || 'All ages'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#58b7da] to-[#3b82f6] mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-white/50 font-dm-sans mb-1">Quality</p>
                  <p className="text-sm font-semibold text-white">HD</p>
                </div>
              </div>

              {/* Download Options Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm mb-6">
                <h3 className="text-lg font-semibold font-fredoka text-white mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#ea1974]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Free {displayTitle} Coloring Page Download
                </h3>

                {/* Color Selection */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-white/70 mb-3">Select Version</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setSelectedColor('bw'); setImageLoaded(false); gaEvent('color_mode_toggle', { mode: 'bw' }); }}
                      disabled={!bwAsset}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedColor === 'bw' ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/30 bg-white/5'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">Black & White</p>
                          <p className="text-xs text-white/50">Ready to color</p>
                        </div>
                      </div>
                      {selectedColor === 'bw' && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#ea1974] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => { setSelectedColor('color'); setImageLoaded(false); gaEvent('color_mode_toggle', { mode: 'color' }); }}
                      disabled={!colorAsset}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedColor === 'color' ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/30 bg-white/5'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ea1974] via-[#bc25c4] to-[#58b7da] flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"/>
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">Full Color</p>
                          <p className="text-xs text-white/50">Reference guide</p>
                        </div>
                      </div>
                      {selectedColor === 'color' && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#ea1974] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Format Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/70 mb-3">Select Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setSelectedFormat('jpeg'); gaEvent('format_toggle', { format: 'jpeg' }); }}
                      disabled={!selectedAsset?.jpegUrl}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedFormat === 'jpeg' ? 'border-[#58b7da] bg-[#58b7da]/10' : 'border-white/10 hover:border-white/30 bg-white/5'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedFormat === 'jpeg' ? 'bg-[#58b7da]' : 'bg-white/10'}`}>
                          <span className="text-xs font-bold text-white">JPG</span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">JPEG Image</p>
                          <p className="text-xs text-white/50">Best for digital use</p>
                        </div>
                      </div>
                      {selectedFormat === 'jpeg' && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#58b7da] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => { setSelectedFormat('pdf'); gaEvent('format_toggle', { format: 'pdf' }); }}
                      disabled={!selectedAsset?.pdfUrl}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedFormat === 'pdf' ? 'border-[#ea1974] bg-[#ea1974]/10' : 'border-white/10 hover:border-white/30 bg-white/5'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedFormat === 'pdf' ? 'bg-[#ea1974]' : 'bg-white/10'}`}>
                          <span className="text-xs font-bold text-white">PDF</span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">PDF Document</p>
                          <p className="text-xs text-white/50">Best for printing</p>
                        </div>
                      </div>
                      {selectedFormat === 'pdf' && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#ea1974] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading || !getDownloadUrl()}
                  className="group relative w-full py-4 px-6 rounded-xl font-bold text-white text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)' }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-full pointer-events-none transition-transform duration-700"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.3) 55%, transparent 60%)',
                      transform: isDownloading ? 'translateX(100%)' : 'translateX(-100%)',
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-3">
                    {isDownloading ? (
                      <>
                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Preparing Download...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Free {selectedFormat.toUpperCase()}
                      </>
                    )}
                  </span>
                </button>

                <p className="text-center text-white/40 text-xs mt-3 font-dm-sans">
                  Instant download • No sign-up required • 100% Free
                </p>

                {/* ── Social Share Buttons ── */}
                {/* <div className="flex gap-3 mt-4 justify-center">
                  {pinterestUrl && (
                    <a
                      href={pinterestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:scale-105"
                      style={{ background: '#E60023' }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                      </svg>
                      Save to Pinterest
                    </a>
                  )}
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:scale-105"
                    style={{ background: '#000000' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Share on X
                  </a>
                </div> */}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <svg className="w-6 h-6 text-green-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs text-white/60 text-center">Safe & Secure</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <svg className="w-6 h-6 text-blue-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs text-white/60 text-center">Instant Access</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <svg className="w-6 h-6 text-purple-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-xs text-white/60 text-center">Free to Print</span>
                </div>
              </div>

              {/* ── Star Rating Widget ── */}
              <div className="mb-8 rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                <div className="flex">

                  {/* Left — User input */}
                  <div className="flex-1 p-5 flex flex-col gap-2">
                    <p className="text-xs text-white/35 font-dm-sans uppercase tracking-widest">
                      {hasVoted ? 'Your Rating' : 'Rate This Page'}
                    </p>

                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => {
                        const isActive = hasVoted
                          ? (selectedRating ?? 0) >= star
                          : (hoveredStar ?? 0) >= star;
                        return (
                          <button
                            key={star}
                            className="star-btn"
                            disabled={hasVoted}
                            onMouseEnter={() => !hasVoted && setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(null)}
                            onClick={() => handleRating(star)}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            <svg className="w-7 h-7" viewBox="0 0 24 24">
                              <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                fill={isActive ? '#f59e0b' : 'none'}
                                stroke={isActive ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                                strokeWidth={1.5}
                                style={{ transition: 'fill 0.12s ease, stroke 0.12s ease' }}
                              />
                            </svg>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-xs text-white/30 font-dm-sans" style={{ minHeight: '1rem' }}>
                      {hasVoted
                        ? `You rated ${selectedRating} out of 5`
                        : hoveredStar
                          ? (['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing!'] as const)[hoveredStar]
                          : ratingCount === 0
                            ? 'Be the first to review!'
                            : 'Tap a star to rate'}
                    </p>

                    {ratingMessage && (
                      <p className="text-xs font-dm-sans text-[#58b7da]">{ratingMessage}</p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="w-px my-4 bg-white/8" />

                  {/* Right — Community rating */}
                  <div className="flex-1 p-5 flex flex-col gap-2">
                    <p className="text-xs text-white/35 font-dm-sans uppercase tracking-widest">Community Rating</p>

                    {ratingCount > 0 ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold font-fredoka text-white/90 leading-none">{currentRatingValue}</span>
                          <span className="text-sm text-white/25 font-dm-sans">/5</span>
                        </div>

                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => {
                            const fill = currentRatingValue >= star ? 'full' : currentRatingValue >= star - 0.5 ? 'half' : 'empty';
                            return (
                              <svg key={star} className="w-4 h-4" viewBox="0 0 24 24">
                                <defs>
                                  <linearGradient id={`avg-${star}`} x1="0" x2="1" y1="0" y2="0">
                                    <stop offset="50%" stopColor="#f59e0b" />
                                    <stop offset="50%" stopColor="transparent" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                  fill={fill === 'full' ? '#f59e0b' : fill === 'half' ? `url(#avg-${star})` : 'none'}
                                  stroke={fill === 'empty' ? 'rgba(255,255,255,0.15)' : '#f59e0b'}
                                  strokeWidth={1.5}
                                />
                              </svg>
                            );
                          })}
                        </div>

                        <p className="text-xs text-white/30 font-dm-sans">
                          {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg key={star} className="w-4 h-4" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs text-white/25 font-dm-sans">No reviews yet</p>
                      </>
                    )}
                  </div>

                </div>
              </div>

              {/* Ad: Below Controls — Placement A */}
              <div className="mt-6">
                <AdUnit
                  slot="REPLACE_WITH_SLOT_ID_CONTROLS"
                  format="auto"
                  reservedHeight={250}
                  lazy={false}
                />
              </div>

              {/* Back Link */}
              <div className="pt-6 border-t border-white/10">
                <Link
                  href="/free-coloring-pages"
                  className="inline-flex items-center gap-2 text-white/50 hover:text-[#ea1974] font-dm-sans text-sm transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Browse More Coloring Pages
                </Link>
              </div>
            </div>
          </div>

          {/* ── About + Printing Tips (full-width 2-col) ── */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {pageData.description && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold font-fredoka text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#58b7da]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About This Free Coloring Page
                </h2>
                <p className="text-white/70 font-dm-sans leading-relaxed text-sm">{pageData.description}</p>
              </div>
            )}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-lg font-semibold font-fredoka text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#ea1974]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                How to Print This Free Coloring Page
              </h2>
              <p className="text-white/70 font-dm-sans leading-relaxed text-sm">
                {pageData.printingTips || PRINTING_TIPS_FALLBACK(pageData.difficulty)}
              </p>
            </div>
          </div>

          {/* Ad: Before Related Pages — Placement B */}
          <div className="mt-10">
            <AdUnit
              slot="REPLACE_WITH_SLOT_ID_RELATED"
              format="fluid"
              layout="in-article"
              reservedHeight={280}
              lazy={true}
            />
          </div>

          {/* ── Related Coloring Pages (full-width) ── */}
          {relatedPages.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-fredoka text-white">
                  More Free {pageData.categoryName ? `${pageData.categoryName} ` : ''}Printable Coloring Pages
                </h2>
                <Link
                  href={`/${pageData.categoryName ? `${pageData.categoryName.toLowerCase().replace(/\s+/g, '-')}-` : ''}coloring-pages`}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-dm-sans text-white/50 hover:text-white transition-colors"
                >
                  View all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                {relatedPages.map(rp => (
                  <Link
                    key={rp.id}
                    href={`/${rp.slug}-coloring-page`}
                    className="group block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[3/4] bg-white/10">
                      {rp.bwPreview ? (
                        <Image
                          src={rp.bwPreview}
                          alt={`${rp.title} Coloring Page`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/20">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-white/70 font-dm-sans truncate group-hover:text-white transition-colors">
                        {rp.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
