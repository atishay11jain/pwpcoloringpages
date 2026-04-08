'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  layout?: 'in-article' | 'in-feed';
  className?: string;
  reservedHeight?: number;
  showOnMobile?: boolean;
  lazy?: boolean;
}

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? '';

export default function AdUnit({
  slot,
  format = 'auto',
  layout,
  className = '',
  reservedHeight = 250,
  showOnMobile = true,
  lazy = true,
}: AdUnitProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const pushed = useRef(false);

  // Do not render on admin routes or if publisher ID is missing
  if (pathname.startsWith('/admin') || !PUBLISHER_ID) return null;

  return (
    <div
      ref={containerRef}
      className={`${showOnMobile === false ? 'hidden lg:block' : ''} ${className}`}
    >
      <AdSlot
        containerRef={containerRef}
        slot={slot}
        format={format}
        layout={layout}
        reservedHeight={reservedHeight}
        lazy={lazy}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        pushed={pushed}
      />
    </div>
  );
}

// Inner client component handles the effect + IntersectionObserver
function AdSlot({
  containerRef,
  slot,
  format,
  layout,
  reservedHeight,
  lazy,
  isVisible,
  setIsVisible,
  pushed,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  slot: string;
  format: string;
  layout?: string;
  reservedHeight: number;
  lazy: boolean;
  isVisible: boolean;
  setIsVisible: (v: boolean) => void;
  pushed: React.RefObject<boolean>;
}) {
  useEffect(() => {
    if (!lazy) {
      setIsVisible(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, containerRef, setIsVisible]);

  useEffect(() => {
    if (!isVisible || pushed.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not yet available — will retry on next render
    }
  }, [isVisible, pushed]);

  return (
    <div style={{ minHeight: reservedHeight, width: '100%' }}>
      {isVisible ? (
        /* White surface wrapper — Google ad creatives are always light-background */
        <div className="bg-white rounded-lg overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={PUBLISHER_ID}
            data-ad-slot={slot}
            data-ad-format={format}
            {...(layout ? { 'data-ad-layout': layout } : {})}
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        /* Skeleton placeholder reserves space while waiting for visibility */
        <div
          className="bg-white/5 rounded-lg animate-pulse"
          style={{ minHeight: reservedHeight }}
        />
      )}
    </div>
  );
}
