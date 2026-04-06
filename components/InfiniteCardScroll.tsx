'use client';

import { ReactNode } from 'react';

interface InfiniteCardScrollProps {
  children: ReactNode;
  speed?: number; // seconds for one complete scroll
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
}

export default function InfiniteCardScroll({
  children,
  speed = 30,
  direction = 'left',
  pauseOnHover = true,
}: InfiniteCardScrollProps) {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

      {/* Scrolling Container */}
      <div
        className={`flex gap-4 sm:gap-6 ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        style={{
          animation: `scroll-${direction} ${speed}s linear infinite`,
        }}
      >
        {/* Original Items */}
        <div className="flex gap-4 sm:gap-6 shrink-0">
          {children}
        </div>
        {/* Duplicated Items for seamless loop */}
        <div className="flex gap-4 sm:gap-6 shrink-0" aria-hidden="true">
          {children}
        </div>
        {/* Third set for extra smoothness on wide screens */}
        <div className="flex gap-4 sm:gap-6 shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
        @keyframes scroll-right {
          0% {
            transform: translateX(calc(-100% / 3));
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
