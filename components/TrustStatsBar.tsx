'use client';

import { useEffect, useRef, useState } from 'react';

interface Stats {
  totalPages: number;
  totalCategories: number;
  totalDownloads: number;
}

function useCountUp(target: number, duration: number = 1800, active: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

function StatBlock({
  value,
  label,
  suffix,
  active,
  icon,
}: {
  value: number;
  label: string;
  suffix?: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  const count = useCountUp(value, 1800, active);
  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();

  return (
    <div className="flex flex-col items-center gap-2 px-8 py-5 relative group">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10 mb-1 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-3xl sm:text-4xl font-bold font-fredoka text-white tabular-nums">
        {formatted}
        {suffix && <span className="text-pink-400">{suffix}</span>}
      </div>
      <div className="text-sm font-dm-sans text-white/50 tracking-wide uppercase text-center">
        {label}
      </div>
    </div>
  );
}

export default function TrustStatsBar() {
  const [stats, setStats] = useState<Stats>({ totalPages: 100, totalCategories: 10, totalDownloads: 5000 });
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => {
        if (!r.ok) throw new Error('stats fetch failed');
        return r.json();
      })
      .then((data: Stats) => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-6 overflow-hidden">
      {/* subtle top/bottom borders with gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      {/* glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5" />

      <div className="relative max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <StatBlock
            value={stats.totalPages === 0 ? 110 : stats.totalPages}
            label="Free Coloring Pages"
            suffix="+"
            active={active}
            icon={
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatBlock
            value={stats.totalCategories === 0 ? 11 : stats.totalCategories}
            label="Categories to Explore"
            suffix="+"
            active={active}
            icon={
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
          />
          <StatBlock
            value={stats.totalDownloads === 0 ? 2700 : stats.totalDownloads}
            label="Pages Downloaded"
            suffix="+"
            active={active}
            icon={
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}
