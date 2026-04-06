'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ColoringBook {
  id: string;
  title: string;
  amazon_url: string | null;
  status: string;
}

const NAV_EXPLORE = [
  { label: 'Browse All Coloring Pages', href: '/free-coloring-pages' },
  { label: 'Animals Coloring Pages',    href: '/animals-coloring-pages' },
  { label: 'K-pop Coloring Pages',      href: '/k-pop-coloring-pages' },
  { label: 'Dinosaur Coloring Pages',   href: '/dinosaur-coloring-pages' },
  { label: 'Unicorn Coloring Pages',    href: '/unicorn-coloring-pages' },
  { label: 'Princess Coloring Pages',   href: '/princess-coloring-pages' },
];

const NAV_COMPANY = [
  { label: 'About',            href: '/about' },
  { label: 'Contact',          href: '/contact' },
  { label: 'Privacy Policy',   href: '/privacy-policy' },
];

const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    hoverBorder: 'rgba(59,130,246,0.5)',
    hoverBg: 'rgba(59,130,246,0.08)',
    hoverColor: '#60a5fa',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    hoverBorder: 'rgba(244,114,182,0.5)',
    hoverBg: 'rgba(244,114,182,0.08)',
    hoverColor: '#f472b6',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    hoverBorder: 'rgba(239,68,68,0.5)',
    hoverBg: 'rgba(239,68,68,0.08)',
    hoverColor: '#f87171',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

function NavLink({ href, label, dot }: { href: string; label: string; dot: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-2.5 text-sm font-dm-sans text-white/50 hover:text-white transition-colors duration-200"
      >
        <span
          className="w-1 h-1 rounded-full flex-shrink-0 transition-colors duration-200"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = dot; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
        />
        {label}
      </Link>
    </li>
  );
}

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<SubscribeStatus>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [coloringBooks, setColoringBooks] = useState<ColoringBook[]>([]);

  useEffect(() => {
    fetch('/api/coloring-books')
      .then((r) => r.json())
      .then((data) => setColoringBooks((data.books || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmail('');
    setSubscribeStatus('idle');
    setSubscribeMessage('');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeStatus('loading');
    setSubscribeMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubscribeStatus('success');
        setSubscribeMessage(data.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        setSubscribeStatus('error');
        setSubscribeMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubscribeStatus('error');
      setSubscribeMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <>
      <footer id="footer" className="relative overflow-hidden" style={{ background: '#0c0b12' }}>

        {/* ── Top rainbow rule ──────────────────────────────────── */}
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #ea1974 18%, #bc25c4 36%, #7c3aed 50%, #2563eb 68%, #0891b2 84%, transparent 100%)',
          }}
        />

        {/* ── Background atmosphere ────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(188,37,196,0.1), transparent 65%)',
              filter: 'blur(48px)',
            }}
          />
          <div
            className="absolute -bottom-16 right-0 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(8,145,178,0.08), transparent 65%)',
              filter: 'blur(56px)',
            }}
          />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.022]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* ── Main content ─────────────────────────────────────── */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8 lg:pt-20 lg:pb-10">

          {/* 4-col main grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-14">

            {/* ── Brand ─────────────────────────────────────────── */}
            <div className="sm:col-span-2 lg:col-span-1">
              {/* Logo + wordmark */}
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-shrink-0">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(234,25,116,0.35), transparent 70%)',
                      filter: 'blur(10px)',
                    }}
                  />
                  <Image
                    src="/logo.png"
                    alt="Paint With Purpose"
                    width={46}
                    height={46}
                    className="relative rounded-full object-contain"
                  />
                </div>
                <div className="leading-[1.1]">
                  <span className="block text-xl font-bold text-white font-fredoka">Paint With</span>
                  <span
                    className="block text-xl font-bold font-fredoka"
                    style={{
                      background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Purpose
                  </span>
                </div>
              </div>

              <p className="text-white/45 text-sm font-dm-sans leading-relaxed mb-6 max-w-[260px]">
                Hundreds of free printable coloring pages for kids and adults. Download, print, and create — no sign-up needed.
              </p>

              {/* Coloring books pills */}
              {coloringBooks.length > 0 && (
                <div>
                  <Link href="/coloring-books" className="block w-fit text-[10px] font-dm-sans font-semibold uppercase tracking-[0.2em] text-white/25 hover:text-white transition-colors duration-200 mb-3 cursor-pointer select-text">
                    Our Books
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {coloringBooks.map((book) =>
                      book.amazon_url ? (
                        <a
                          key={book.id}
                          href={book.amazon_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-dm-sans text-white/55 hover:text-white border border-white/10 hover:border-white/22 bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200"
                        >
                          <svg
                            className="w-3 h-3 text-orange-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          {book.title}
                        </a>
                      ) : (
                        <span
                          key={book.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-dm-sans text-white/25 border border-white/8"
                        >
                          {book.title}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Explore ───────────────────────────────────────── */}
            <div>
              <h4 className="text-[10px] font-dm-sans font-bold uppercase tracking-[0.22em] text-white/30 mb-5">
                Explore
              </h4>
              <ul className="space-y-3">
                {NAV_EXPLORE.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} dot="#f472b6" />
                ))}
              </ul>
            </div>

            {/* ── Company ───────────────────────────────────────── */}
            <div>
              <h4 className="text-[10px] font-dm-sans font-bold uppercase tracking-[0.22em] text-white/30 mb-5">
                Company
              </h4>
              <ul className="space-y-3">
                {NAV_COMPANY.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} dot="#a78bfa" />
                ))}
              </ul>
            </div>

            {/* ── Connect ───────────────────────────────────────── */}
            <div>
              <h4 className="text-[10px] font-dm-sans font-bold uppercase tracking-[0.22em] text-white/30 mb-5">
                Connect
              </h4>

              {/* Social icons */}
              <div className="flex gap-2.5 mb-8">
                {SOCIALS.map((s) => (
                  <SocialIcon key={s.label} {...s} />
                ))}
              </div>

              {/* Newsletter mini-block */}
              <div
                className="rounded-xl p-4 border border-white/[0.07]"
                style={{ background: 'rgba(255,255,255,0.025)' }}
              >
                <p className="text-[11px] font-dm-sans text-white/38 leading-relaxed mb-3.5">
                  Fresh free printable coloring pages delivered to your inbox every week — free, forever.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full group py-2.5 px-4 rounded-lg font-dm-sans font-semibold text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)',
                    boxShadow: '0 4px 16px rgba(188,37,196,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(188,37,196,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(188,37,196,0.2)';
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Subscribe Free
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Bottom bar ─────────────────────────────────────── */}
          <div className="pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/25 text-xs font-dm-sans">
              © {new Date().getFullYear()} Paint With Purpose. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-3">
              <Link
                href="/privacy-policy"
                className="text-white/25 hover:text-white/55 text-xs font-dm-sans transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span className="text-white/12 text-xs select-none">·</span>
              <span className="text-white/20 text-xs font-dm-sans">Made with ♥</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Subscription Modal ───────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ animation: 'atelierFadeIn 0.2s ease forwards' }}
        >
          <style>{`
            @keyframes atelierFadeIn {
              from { opacity: 0 }
              to   { opacity: 1 }
            }
            @keyframes atelierSlideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.98) }
              to   { opacity: 1; transform: translateY(0)    scale(1)    }
            }
            @keyframes atelierShimmer {
              from { transform: translateX(-100%) skewX(-18deg) }
              to   { transform: translateX(220%)  skewX(-18deg) }
            }
            @keyframes atelierPulse {
              0%, 100% { opacity: 0.6 }
              50%       { opacity: 1   }
            }
            @keyframes atelierBorderFlow {
              0%   { background-position: 0%   50% }
              50%  { background-position: 100% 50% }
              100% { background-position: 0%   50% }
            }
          `}</style>

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleCloseModal}
          />

          {/* Animated gradient border wrapper */}
          <div
            className="relative w-full max-w-[660px] rounded-[20px] p-px"
            style={{
              animation: 'atelierSlideUp 0.38s cubic-bezier(0.16,1,0.3,1) forwards',
              background: 'linear-gradient(135deg, #ea1974, #bc25c4, #7c3aed, #2563eb, #06b6d4, #bc25c4, #ea1974)',
              backgroundSize: '300% 300%',
              animationName: 'atelierSlideUp, atelierBorderFlow',
              animationDuration: '0.38s, 5s',
              animationTimingFunction: 'cubic-bezier(0.16,1,0.3,1), linear',
              animationFillMode: 'forwards, none',
              animationIterationCount: '1, infinite',
              boxShadow: '0 0 0 1px rgba(188,37,196,0.12), 0 0 48px rgba(188,37,196,0.2), 0 0 80px rgba(8,145,178,0.12), 0 28px 56px rgba(0,0,0,0.65)',
            }}
          >
            {/* Inner card */}
            <div
              className="relative rounded-[19px] overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #110f1e 0%, #0d0c19 60%, #090816 100%)' }}
            >
              {/* Ambient glow blobs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="absolute -top-28 -left-28 w-72 h-72 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(234,25,116,0.16) 0%, transparent 70%)', filter: 'blur(44px)' }}
                />
                <div
                  className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(8,145,178,0.13) 0%, transparent 70%)', filter: 'blur(52px)' }}
                />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)', filter: 'blur(36px)' }}
                />
                {/* Noise grain overlay */}
                <div
                  className="absolute inset-0 opacity-[0.028]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '180px 180px',
                  }}
                />
              </div>

              {/* Two-panel grid */}
              <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">

                {/* ── LEFT: Brand panel ── */}
                <div className="relative flex flex-col justify-between p-7 md:p-8 border-b md:border-b-0 md:border-r border-white/[0.055]">

                  <div>
                    {/* Eyebrow label */}
                    <div className="flex items-center gap-2.5 mb-5">
                      <div
                        className="w-5 h-px flex-shrink-0"
                        style={{ background: 'linear-gradient(90deg, #ea1974, #7c3aed)' }}
                      />
                      <span className="text-[10px] font-dm-sans font-bold tracking-[0.24em] uppercase text-white/32">
                        Weekly Newsletter
                      </span>
                    </div>

                    {/* Headline */}
                    <h2 className="font-fredoka font-bold text-white leading-[1.02] mb-4" style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)' }}>
                      Get Free
                      <br />
                      <span
                        style={{
                          background: 'linear-gradient(108deg, #ea1974 0%, #f97316 30%, #eab308 62%, #22c55e 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        Coloring Pages
                      </span>
                      <br />
                      Every Week.
                    </h2>

                    <p className="text-[13px] text-white/38 font-dm-sans leading-relaxed" style={{ maxWidth: '195px' }}>
                      Fresh free printable coloring pages, exclusive designs &amp; creative inspiration — delivered free, forever.
                    </p>
                  </div>

                  {/* Bottom: palette strip + trust chips */}
                  <div className="mt-7 md:mt-6">
                    {/* 7-color palette strip */}
                    <div className="flex gap-[3px] mb-4">
                      {['#ea1974','#f97316','#eab308','#22c55e','#06b6d4','#7c3aed','#ec4899'].map((c) => (
                        <div
                          key={c}
                          className="flex-1 rounded-full"
                          style={{ height: '5px', background: c, opacity: 0.72 }}
                        />
                      ))}
                    </div>
                    {/* Trust chips */}
                    <div className="flex flex-col gap-[9px]">
                      {[
                        { color: '#22c55e', label: '100% free, always' },
                        { color: '#3b82f6', label: 'Zero spam, ever' },
                        { color: '#a78bfa', label: 'Unsubscribe in one click' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <div
                            className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                            style={{ background: item.color, boxShadow: `0 0 5px ${item.color}88` }}
                          />
                          <span className="text-[11px] text-white/32 font-dm-sans">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── RIGHT: Form panel ── */}
                <div className="relative p-7 md:p-8 flex flex-col justify-center">

                  {/* Close button */}
                  <button
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{ color: 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.28)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {subscribeStatus === 'success' ? (
                    /* ── Success state ── */
                    <div className="text-center py-4">
                      {/* Checkmark ring */}
                      <div
                        className="inline-flex items-center justify-center w-[52px] h-[52px] rounded-[14px] mb-4"
                        style={{
                          background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(6,182,212,0.12))',
                          border: '1px solid rgba(34,197,94,0.22)',
                        }}
                      >
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="font-fredoka text-[1.4rem] font-bold text-white mb-1.5">You&apos;re in!</p>
                      <p className="text-[13px] text-white/42 font-dm-sans mb-5 leading-relaxed">{subscribeMessage}</p>
                      <button
                        onClick={handleCloseModal}
                        className="px-4 py-2 rounded-lg text-[13px] font-dm-sans font-medium transition-all duration-200"
                        style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.09)', background: 'transparent' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)';
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)';
                        }}
                      >
                        Back to browsing
                      </button>
                    </div>
                  ) : (
                    /* ── Form state ── */
                    <>
                      {/* Envelope icon */}
                      <div
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
                        style={{
                          background: 'linear-gradient(135deg, rgba(234,25,116,0.14), rgba(188,37,196,0.14))',
                          border: '1px solid rgba(234,25,116,0.18)',
                        }}
                      >
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ea1974' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>

                      <p className="text-[13px] text-white/48 font-dm-sans mb-5 leading-relaxed">
                        Join{' '}
                        <span className="text-white/75 font-semibold">2,400+ creative families</span>
                        {' '}getting new pages every week.
                      </p>

                      <form onSubmit={handleSubscribe} className="space-y-3">
                        {/* Label */}
                        <label className="block text-[10px] font-dm-sans font-bold tracking-[0.22em] uppercase text-white/28">
                          Email address
                        </label>

                        {/* Input field */}
                        <input
                          type="email"
                          placeholder="hello@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (subscribeStatus === 'error') {
                              setSubscribeStatus('idle');
                              setSubscribeMessage('');
                            }
                          }}
                          required
                          disabled={subscribeStatus === 'loading'}
                          className="w-full px-4 py-[11px] rounded-xl text-[13px] text-white font-dm-sans placeholder-white/22 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: subscribeStatus === 'error'
                              ? '1px solid rgba(248,113,113,0.48)'
                              : '1px solid rgba(255,255,255,0.08)',
                          }}
                          onFocus={(e) => {
                            if (subscribeStatus !== 'error') {
                              (e.target as HTMLInputElement).style.borderColor = 'rgba(188,37,196,0.45)';
                              (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.06)';
                              (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(188,37,196,0.08)';
                            }
                          }}
                          onBlur={(e) => {
                            if (subscribeStatus !== 'error') {
                              (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)';
                              (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.04)';
                              (e.target as HTMLInputElement).style.boxShadow = 'none';
                            }
                          }}
                        />

                        {/* Error message */}
                        {subscribeStatus === 'error' && subscribeMessage && (
                          <p className="text-red-400 text-[11px] font-dm-sans flex items-center gap-1.5 pl-0.5">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {subscribeMessage}
                          </p>
                        )}

                        {/* CTA button */}
                        <button
                          type="submit"
                          disabled={subscribeStatus === 'loading'}
                          className="relative w-full py-[11px] rounded-xl font-dm-sans font-bold text-[13px] text-white overflow-hidden transition-all duration-250 disabled:opacity-55 disabled:cursor-not-allowed"
                          style={{
                            background: 'linear-gradient(108deg, #ea1974 0%, #bc25c4 48%, #58b7da 100%)',
                            boxShadow: '0 4px 16px rgba(188,37,196,0.28)',
                          }}
                          onMouseEnter={(e) => {
                            if (subscribeStatus !== 'loading') {
                              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 22px rgba(188,37,196,0.44)';
                              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(188,37,196,0.28)';
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                          }}
                        >
                          {/* Shimmer sweep */}
                          <span
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.16) 50%, transparent 62%)',
                              animation: 'atelierShimmer 2.4s ease-in-out infinite',
                            }}
                          />
                          <span className="relative flex items-center justify-center gap-2">
                            {subscribeStatus === 'loading' ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Subscribing…
                              </>
                            ) : (
                              <>
                                Subscribe Free
                                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </>
                            )}
                          </span>
                        </button>
                      </form>

                      <p className="mt-3.5 text-[10px] text-white/20 font-dm-sans text-center">
                        By subscribing you agree to our{' '}
                        <a href="/privacy-policy" className="underline underline-offset-2 transition-colors hover:text-white/42">
                          privacy policy
                        </a>.
                      </p>
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SocialIcon({
  label,
  href,
  hoverBorder,
  hoverBg,
  hoverColor,
  icon,
}: {
  label: string;
  href: string;
  hoverBorder: string;
  hoverBg: string;
  hoverColor: string;
  icon: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
      style={{
        border: `1px solid ${hovered ? hoverBorder : 'rgba(255,255,255,0.1)'}`,
        background: hovered ? hoverBg : 'transparent',
        color: hovered ? hoverColor : 'rgba(255,255,255,0.35)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
    </a>
  );
}
