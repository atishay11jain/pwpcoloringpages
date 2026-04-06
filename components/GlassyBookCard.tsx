'use client';

import Image from 'next/image';
import { useState } from 'react';

interface GlassyBookCardProps {
  title: string;
  imageUrl: string;
  amazonUrl: string;
  status?: 'coming_soon' | 'available' | 'out_of_stock';
  delay?: number;
  description?: string;
  pageCount?: number;
}

export default function GlassyBookCard({
  title,
  imageUrl,
  amazonUrl,
  status = 'available',
  delay = 0,
  description,
  pageCount = 24,
}: GlassyBookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const isPurchasable = status === 'available';
  const statusLabel = status === 'coming_soon' ? 'Coming Soon' : status === 'out_of_stock' ? 'Out of Stock' : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="group h-full"
      style={{
        animation: `glassyFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="relative h-full">
        {/* Main Card with Glassmorphism */}
        <div
          className="relative h-[580px] rounded-3xl overflow-hidden transition-all duration-700 ease-out"
          style={{
            transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
            boxShadow: isHovered
              ? '0 40px 80px -20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              : '0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Image Section */}
          <div className="relative h-[340px] overflow-hidden">
            <Image
              src={imageUrl || '/placeholder.png'}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 ease-out"
              style={{
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/90"></div>

            {/* Status Badge */}
            {statusLabel && (
              <div className="absolute top-5 right-5 backdrop-blur-xl bg-white/20 border border-white/30 px-4 py-2 rounded-full">
                <span className="text-white text-sm font-bold tracking-wide drop-shadow-lg">
                  {statusLabel}
                </span>
              </div>
            )}

            {/* Page Count Badge */}
            {!statusLabel && (
              <div className="absolute top-5 left-5 backdrop-blur-xl bg-white/15 border border-white/25 px-4 py-2 rounded-full flex items-center gap-2">
                <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-white text-sm font-bold tracking-wide drop-shadow-lg">
                  {pageCount} Pages
                </span>
              </div>
            )}

            {/* Floating gradient orb on hover */}
            {isHovered && (
              <div
                className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-amber-400/30 via-teal-400/30 to-rose-400/30 blur-3xl transition-opacity duration-500"
                style={{
                  left: mousePosition.x - 128,
                  top: mousePosition.y - 128,
                  opacity: 0.6,
                }}
              ></div>
            )}
          </div>

          {/* Glassy Content Section */}
          <div className="relative h-[240px] backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border-t border-white/10">
            {/* Noise texture */}
            <div
              className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="3" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
              }}
            ></div>

            {/* Gradient shine effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y - 340}px, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              }}
            ></div>

            <div className="relative p-6 flex flex-col h-full">
              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-3 leading-tight tracking-tight drop-shadow-lg">
                {title}
              </h3>

              {/* Description */}
              {description && (
                <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-2 drop-shadow">
                  {description}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="px-3 py-1 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
                  <span className="text-white/80 text-xs font-medium">Premium Quality</span>
                </div>
                <div className="px-3 py-1 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
                  <span className="text-white/80 text-xs font-medium">Single-Sided</span>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-grow"></div>

              {/* Button */}
              {isPurchasable ? (
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative block w-full overflow-hidden rounded-2xl transition-all duration-300"
                >
                  {/* Glassmorphism button */}
                  <div className="absolute inset-0 backdrop-blur-xl bg-white/20 border border-white/30 transition-all duration-500 group-hover/btn:bg-white/30 group-hover/btn:border-white/40"></div>

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-teal-400/0 to-rose-400/0 transition-all duration-500 group-hover/btn:from-amber-400/20 group-hover/btn:via-teal-400/20 group-hover/btn:to-rose-400/20"></div>

                  {/* Shimmer */}
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>

                  {/* Content */}
                  <div className="relative px-6 py-4 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-white font-bold text-lg tracking-wide drop-shadow-lg">
                      Buy on Amazon
                    </span>
                    <svg className="w-5 h-5 text-white transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-white/30 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                </a>
              ) : (
                <div className="relative w-full rounded-2xl overflow-hidden">
                  <div className="backdrop-blur-xl bg-white/5 border border-white/20 px-6 py-4 text-center">
                    <span className="text-white/50 font-bold text-lg">
                      {statusLabel || 'Unavailable'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Border glow */}
          <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none transition-all duration-700 group-hover:border-white/20"></div>
        </div>

        {/* Reflection/Shadow */}
        <div
          className="absolute -bottom-4 left-8 right-8 h-32 rounded-full blur-3xl transition-all duration-700 -z-10"
          style={{
            background: isHovered
              ? 'linear-gradient(to right, rgba(251, 191, 36, 0.15), rgba(20, 184, 166, 0.15), rgba(251, 113, 133, 0.15))'
              : 'rgba(0, 0, 0, 0.2)',
            opacity: isHovered ? 1 : 0.5,
          }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes glassyFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.96);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </div>
  );
}
