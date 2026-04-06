'use client';

import { useState, useEffect, useRef } from 'react';
import GlassyBookCard from './GlassyBookCard';

interface ColoringBook {
  id: string;
  title: string;
  imageUrl: string | null;
  amazonUrl: string | null;
  status: 'coming_soon' | 'available' | 'out_of_stock';
}

interface ColoringBooksCarouselProps {
  books: ColoringBook[];
}

export default function ColoringBooksCarousel({ books }: ColoringBooksCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const visibleCards = 3; // Number of cards visible at once
  const maxIndex = Math.max(0, books.length - visibleCards);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || books.length <= visibleCards) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex, books.length, visibleCards]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    setIsAutoPlaying(false);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
    setIsAutoPlaying(false);
  };

  // Touch/Mouse drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setIsAutoPlaying(false);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (translateX > threshold) {
      handlePrevious();
    } else if (translateX < -threshold) {
      handleNext();
    }

    setTranslateX(0);
  };

  if (books.length === 0) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-110 active:scale-95 group hidden md:flex items-center justify-center"
          aria-label="Previous books"
        >
          <svg className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          <div className="absolute inset-0 rounded-full bg-amber-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 hover:scale-110 active:scale-95 group hidden md:flex items-center justify-center"
          aria-label="Next books"
        >
          <svg className="w-6 h-6 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
          <div className="absolute inset-0 rounded-full bg-teal-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
        </button>

        {/* Cards Container */}
        <div
          ref={carouselRef}
          className="overflow-hidden rounded-3xl"
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-out cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(calc(-${currentIndex * (100 / visibleCards)}% + ${translateX}px))`,
            }}
          >
            {books.map((book, index) => {
              const isActive = index >= currentIndex && index < currentIndex + visibleCards;
              const offset = index - currentIndex;

              return (
                <div
                  key={book.id}
                  className="flex-shrink-0 px-4 transition-all duration-700"
                  style={{
                    width: `${100 / visibleCards}%`,
                    opacity: isActive ? 1 : 0.3,
                    transform: isActive
                      ? `scale(${1 - Math.abs(offset) * 0.08})`
                      : 'scale(0.82)',
                    filter: isActive ? 'blur(0px)' : 'blur(2px)',
                  }}
                >
                  <GlassyBookCard
                    title={book.title}
                    imageUrl={book.imageUrl || ''}
                    amazonUrl={book.amazonUrl || '#'}
                    status={book.status}
                    description={`Spark creativity with this premium ${book.title}. Perfect for all ages, featuring ${book.status === 'available' ? 'high-quality' : 'stunning'} illustrations.`}
                    pageCount={24}
                    delay={0}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {/* Playback control */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 group"
            aria-label={isAutoPlaying ? 'Pause autoplay' : 'Resume autoplay'}
          >
            {isAutoPlaying ? (
              <svg className="w-4 h-4 text-white/60 group-hover:text-white/90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white/60 group-hover:text-white/90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Dots navigation */}
          <div className="flex gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className="group relative"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index === currentIndex
                      ? 'bg-amber-400 w-8'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                ></div>
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-50"></div>
                )}
              </button>
            ))}
          </div>

          {/* Counter */}
          <div className="text-sm text-white/40 font-dm-sans tabular-nums min-w-[4rem] text-center">
            <span className="text-white/70">{currentIndex + 1}</span>
            <span className="mx-1">/</span>
            <span>{maxIndex + 1}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .flex-shrink-0 {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
