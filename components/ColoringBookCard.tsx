'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ColoringBookCardProps {
  title: string;
  imageUrl: string;
  amazonUrl: string;
  status?: 'coming_soon' | 'available' | 'out_of_stock';
  delay?: number;
}

export default function ColoringBookCard({ title, imageUrl, amazonUrl, status = 'available', delay = 0 }: ColoringBookCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isPurchasable = status === 'available';
  const statusLabel = status === 'coming_soon' ? 'Coming Soon' : status === 'out_of_stock' ? 'Out of Stock' : null;

  return (
    <div
      className="group perspective-1000"
      style={{
        animation: `fadeInUp 0.8s ease-out ${delay}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative rounded-3xl overflow-hidden bg-[#1e1e2e] transition-all duration-500 transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered
            ? 'rotateX(5deg) rotateY(5deg) scale(1.05)'
            : 'rotateX(2deg) rotateY(2deg)',
          boxShadow: isHovered
            ? '0 30px 60px -15px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)'
            : '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Image Container */}
        <div className="relative h-96 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 p-4">
          <div className="relative w-full h-full">
            <Image
              src={imageUrl || `https://placehold.co/400x500/f97316/ffffff?text=${encodeURIComponent(title.split(' ')[0])}`}
              alt={title}
              fill
              className="object-contain transition-transform duration-300"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          </div>

          {/* Status Badge */}
          {statusLabel && (
            <div className="absolute top-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {statusLabel}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 bg-[#1e1e2e]">
          <h3 className="text-2xl font-bold text-white mb-4 font-fredoka">
            {title}
          </h3>

          {isPurchasable ? (
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-center py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg font-dm-sans"
            >
              Buy Now
            </a>
          ) : (
            <button
              disabled
              className="block w-full bg-gray-700 text-gray-400 text-center py-3 rounded-xl font-semibold cursor-not-allowed opacity-50 font-dm-sans"
            >
              {statusLabel || 'Unavailable'}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
