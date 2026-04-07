'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { event as gaEvent } from '@/lib/gtag';

interface CarouselItem {
  title: string;
  imageUrl: string;
  href: string;
}

interface TrendingCarouselProps {
  items: CarouselItem[];
}

// Memoized Card component to prevent unnecessary re-renders
const CarouselCard = memo(function CarouselCard({
  item,
  index,
  isActive,
  style,
  onClick,
}: {
  item: CarouselItem;
  index: number;
  isActive: boolean;
  style: React.CSSProperties;
  onClick: () => void;
}) {
  return (
    <div
      className="absolute will-change-transform cursor-pointer"
      style={{
        ...style,
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out, filter 0.5s ease-out',
      }}
      onClick={onClick}
    >
      {/* Card — overflow:hidden clips content, box-shadow still renders outside */}
      <div
        className="relative w-[240px] sm:w-[280px] md:w-[320px] rounded-2xl overflow-hidden transition-all duration-500"
        style={
          isActive
            ? {
                boxShadow: [
                  '0 0 0 1.5px rgba(234,25,116,0.70)',   // sharp pink ring
                  '0 0 0 5px rgba(234,25,116,0.10)',      // soft outer halo
                  '0 32px 80px -8px rgba(0,0,0,0.95)',   // deep drop shadow
                  '0 0 72px -20px rgba(234,25,116,0.50)', // atmospheric pink glow
                ].join(', '),
              }
            : {
                boxShadow: '0 12px 40px -8px rgba(0,0,0,0.65)',
              }
        }
      >
        {/* Card body */}
        <div className="bg-[#0d0d18]">

          {/* ── Image area ── */}
          <div className="relative aspect-[3.5/4] overflow-hidden">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, 320px"
              className={`object-cover transition-all duration-700 ${
                isActive
                  ? 'scale-[1.06] brightness-100 saturate-100'
                  : 'scale-100 brightness-[0.60] saturate-[0.45]'
              }`}
              loading={index < 3 ? 'eager' : 'lazy'}
            />

            {/* Rich layered vignette — bottom fade + corner shadows */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                // background: [
                //   'linear-gradient(to top, #0d0d18 0%, rgba(13,13,24,0.5) 30%, transparent 55%)',
                //   'radial-gradient(ellipse at top left, rgba(0,0,0,0.28) 0%, transparent 52%)',
                //   'radial-gradient(ellipse at top right, rgba(0,0,0,0.20) 0%, transparent 48%)',
                // ].join(', '),
              }}
            />

            {/* Active: warm pink atmosphere rising from bottom */}
            {/* {isActive && (
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(234,25,116,0.20) 0%, transparent 48%)',
                }}
              />
            )} */}

            {/* Trending badge — active only */}
            {isActive && (
              <div
                className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-[5px] rounded-full"
                style={{
                  background: 'rgba(8,8,18,0.72)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(234,25,116,0.48)',
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#ea1974',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                  style={{ background: '#ea1974' }}
                />
                Trending
              </div>
            )}

            {/* Rank badge — always visible */}
            <div
              className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #ea1974, #bc25c4)'
                  : 'rgba(0,0,0,0.52)',
                backdropFilter: 'blur(8px)',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.08)',
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.22)',
                boxShadow: isActive ? '0 2px 16px rgba(234,25,116,0.65)' : 'none',
              }}
            >
              {index + 1}
            </div>
          </div>

          {/* ── Title footer ── */}
          <div
            className="px-4 py-[14px]"
            style={{
              background: '#111120',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Gradient accent rule — slides in on active */}
            <div
              className="mx-auto mb-2.5 rounded-full transition-all duration-500"
              style={{
                height: '2px',
                width: isActive ? '28px' : '0px',
                background: 'linear-gradient(to right, #ea1974, #58b7da)',
              }}
            />
            <h3
              className={`text-center font-fredoka leading-snug transition-all duration-300 ${
                isActive
                  ? 'text-white text-[1.05rem] sm:text-lg'
                  : 'text-white/38 text-sm sm:text-[0.95rem]'
              }`}
            >
              {item.title.replace(/\s*coloring\s*page\s*$/i, '').trim()}
            </h3>
          </div>

        </div>
      </div>
    </div>
  );
});

export default function TrendingCarousel({ items }: TrendingCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(Math.floor(items.length / 2));
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || isHovering) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovering, items.length]);

  const handleCardClick = useCallback((index: number, href: string) => {
    if (index === activeIndex) {
      gaEvent('carousel_page_click', { page_title: items[index].title });
      router.push(href);
    } else {
      gaEvent('carousel_navigate', { direction: 'card', position: index });
      setActiveIndex(index);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  }, [activeIndex, router, items]);

  const handlePrev = useCallback(() => {
    gaEvent('carousel_navigate', { direction: 'prev' });
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  }, [items.length]);

  const handleNext = useCallback(() => {
    gaEvent('carousel_navigate', { direction: 'next' });
    setActiveIndex((prev) => (prev + 1) % items.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  }, [items.length]);

  // Memoized card styles calculation
  const cardStyles = useMemo(() => {
    return items.map((_, index) => {
      const directDiff = index - activeIndex;
      const wrapAroundDiff = directDiff > 0 ? directDiff - items.length : directDiff + items.length;
      const diff = Math.abs(directDiff) <= Math.abs(wrapAroundDiff) ? directDiff : wrapAroundDiff;
      const absDiff = Math.abs(diff);

      const translateX = diff * 300;
      const translateZ = -absDiff * 150;
      const rotateY = diff * -25;
      const scale = absDiff === 0 ? 1.02 : 1 - absDiff * 0.15;
      const opacity = absDiff > 3 ? 0 : 1 - absDiff * 0.25;
      const translateY = absDiff === 0 ? -8 : absDiff * 4;

      return {
        transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
        opacity: absDiff > 3 ? 0 : opacity,
        zIndex: items.length - absDiff,
        filter: absDiff === 0 ? 'none' : `blur(${Math.min(absDiff * 0.4, 2)}px)`,
      };
    });
  }, [activeIndex, items.length]);

  return (
    <section className="relative py-16 sm:py-8 md:py-12 overflow-hidden bg-[#080810]">
      {/* Simplified background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs - reduced blur for performance */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/5 rounded-full blur-2xl" />

        {/* Simple grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Section Header - simplified */}
      <div className="relative text-center mb-12 sm:mb-16 px-4">

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-fredoka mb-5">
          <span className="bg-gradient-to-r from-fuchsia-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
            Trending
          </span>
          <span className="text-white/90 ml-2">Free Coloring Pages</span>
        </h2>

        <p className="text-base sm:text-lg text-white/50 font-dm-sans">
          The most-downloaded free printable coloring pages — animals, K-pop, unicorns, dinosaurs & more, loved by kids and adults
        </p>
      </div>

      {/* Carousel Container */}
      <div
        className="relative h-[450px] sm:h-[520px] md:h-[580px] flex items-center justify-center"
        style={{ perspective: '1200px' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Cards */}
        <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
          {items.map((item, index) => (
            <CarouselCard
              key={item.title}
              item={item}
              index={index}
              isActive={index === activeIndex}
              style={cardStyles[index]}
              onClick={() => handleCardClick(index, item.href)}
            />
          ))}
        </div>

        {/* Side gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 md:w-64 bg-gradient-to-r from-[#080810] via-[#080810]/70 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 md:w-64 bg-gradient-to-l from-[#080810] via-[#080810]/70 to-transparent pointer-events-none z-10" />
      </div>

      {/* Navigation Controls - simplified */}
      <div className="relative z-20 mt-8 sm:mt-10">
        {/* Progress dots */}
        <div className="flex justify-center items-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index, items[index].href)}
              className="relative p-1"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${index === activeIndex
                  ? 'bg-gradient-to-r from-fuchsia-400 to-purple-400 scale-125'
                  : 'bg-white/25 hover:bg-white/40'
                }
              `} />
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="flex justify-center mt-4">
          <div className="relative w-40 sm:w-56 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${((activeIndex + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 group"
        aria-label="Previous slide"
      >
        <div className="
          w-10 h-10 sm:w-12 sm:h-12 rounded-full
          bg-white/5 hover:bg-white/10 backdrop-blur-sm
          border border-white/10 hover:border-white/20
          flex items-center justify-center
          transition-all duration-200
          group-hover:scale-105
        ">
          <svg className="w-5 h-5 text-white/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 group"
        aria-label="Next slide"
      >
        <div className="
          w-10 h-10 sm:w-12 sm:h-12 rounded-full
          bg-white/5 hover:bg-white/10 backdrop-blur-sm
          border border-white/10 hover:border-white/20
          flex items-center justify-center
          transition-all duration-200
          group-hover:scale-105
        ">
          <svg className="w-5 h-5 text-white/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </section>
  );
}
