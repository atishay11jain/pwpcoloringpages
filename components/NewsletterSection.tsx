'use client';

import { useState } from 'react';
import { event as gaEvent } from '@/lib/gtag';

const PERKS = ['Free forever', 'New pages weekly', 'No spam, ever'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'loading' | 'success' | 'error';

const PaintDrop = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 4C16 4 6 16 6 22C6 27.5 10.5 32 16 32C21.5 32 26 27.5 26 22C26 16 16 4 16 4Z" />
  </svg>
);

const SparkleIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
  </svg>
);

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isValidEmail = EMAIL_REGEX.test(email.trim());
  const showValidationError = touched && email.trim() !== '' && !isValidEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isValidEmail) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      gaEvent('newsletter_subscribe', { source: 'section' });
      setEmail('');
      setTouched(false);
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">

      {/* Ambient atmosphere */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[130px] opacity-[0.10]"
          style={{ background: 'radial-gradient(ellipse, #bc25c4, transparent 65%)' }}
        />
        <div
          className="absolute -top-20 right-0 w-[320px] h-[320px] rounded-full blur-[100px] opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #ea1974, transparent 65%)' }}
        />
        <div
          className="absolute -bottom-20 left-0 w-[280px] h-[280px] rounded-full blur-[100px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #58b7da, transparent 65%)' }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 32px 80px -16px rgba(0,0,0,0.6)',
          }}
        >
          {/* Top gradient accent bar */}
          <div
            className="h-[3px] w-full"
            style={{ background: 'linear-gradient(to right, #ea1974, #bc25c4 50%, #58b7da)' }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr]">

            {/* ── LEFT: Decorative art panel ─────────────────── */}
            <div
              className="relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(234,25,116,0.07) 0%, rgba(188,37,196,0.10) 60%, rgba(88,183,218,0.05) 100%)',
              }}
            >
              {/* Column divider */}
              <div
                className="absolute right-0 top-10 bottom-10 w-px"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.07), transparent)' }}
              />

              {/* Ghost envelope SVG */}
              <div className="relative mb-8">
                <svg
                  viewBox="0 0 100 80"
                  fill="none"
                  className="w-44 h-36"
                  style={{ stroke: 'rgba(255,255,255,0.11)', strokeWidth: '1.5' }}
                >
                  <rect x="4" y="8" width="92" height="64" rx="5" />
                  <path d="M4 17 L50 47 L96 17" />
                  <path d="M4 72 L33 45" opacity="0.45" />
                  <path d="M96 72 L67 45" opacity="0.45" />
                  <path d="M4 8 L50 42 L96 8" opacity="0.3" strokeDasharray="3 3" />
                </svg>

                <SparkleIcon className="absolute -top-5 -right-3 w-4 h-4 text-amber-400/55 animate-pulse" />
                <SparkleIcon className="absolute bottom-1 -left-6 w-3 h-3 text-pink-400/45 animate-pulse" style={{ animationDelay: '0.6s' }} />
                <SparkleIcon className="absolute top-3 -left-9 w-2.5 h-2.5 text-cyan-400/40 animate-pulse" style={{ animationDelay: '1.2s' }} />
                <SparkleIcon className="absolute -bottom-4 right-4 w-2 h-2 text-purple-400/40 animate-pulse" style={{ animationDelay: '0.9s' }} />
              </div>

              {/* Postmark stamp badge */}
              <div
                className="relative px-5 py-3 text-center"
                style={{
                  transform: 'rotate(-5deg)',
                  border: '1.5px dashed rgba(234,25,116,0.30)',
                  borderRadius: '4px',
                  background: 'rgba(234,25,116,0.05)',
                }}
              >
                <div
                  className="text-[8px] font-mono font-bold tracking-[0.42em] uppercase mb-0.5"
                  style={{ color: 'rgba(234,25,116,0.55)' }}
                >
                  Paint With Purpose
                </div>
                <div
                  className="font-fredoka font-bold tracking-[0.22em] uppercase"
                  style={{ fontSize: '13px', color: 'rgba(234,25,116,0.65)' }}
                >
                  Free Weekly
                </div>
              </div>

              {/* Scattered paint drops */}
              <PaintDrop className="absolute top-7 left-7 w-8 h-8" style={{ color: 'rgba(234,25,116,0.13)', transform: 'rotate(14deg)' }} />
              <PaintDrop className="absolute top-7 right-10 w-5 h-5" style={{ color: 'rgba(188,37,196,0.11)', transform: 'rotate(-8deg)' }} />
              <PaintDrop className="absolute bottom-8 right-7 w-6 h-6" style={{ color: 'rgba(88,183,218,0.13)', transform: 'rotate(6deg)' }} />
              <PaintDrop className="absolute bottom-9 left-8 w-4 h-4" style={{ color: 'rgba(234,25,116,0.09)', transform: 'rotate(-18deg)' }} />
              <PaintDrop className="absolute top-1/2 left-4 w-3 h-3" style={{ color: 'rgba(188,37,196,0.08)', transform: 'rotate(40deg)' }} />
            </div>

            {/* ── RIGHT: Content + Form ───────────────────────── */}
            <div className="relative px-8 sm:px-12 py-12 sm:py-14">

              {/* Mobile-only decorative drops */}
              <PaintDrop className="absolute top-5 right-6 w-16 h-16 lg:hidden" style={{ color: 'rgba(234,25,116,0.05)', transform: 'rotate(14deg)' }} />
              <PaintDrop className="absolute bottom-5 left-4 w-9 h-9 lg:hidden" style={{ color: 'rgba(88,183,218,0.05)', transform: 'rotate(-10deg)' }} />

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] mb-7">
                <svg
                  className="w-3.5 h-3.5"
                  style={{ color: 'rgba(234,25,116,0.65)' }}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span
                  className="font-dm-sans font-medium tracking-[0.2em] uppercase"
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}
                >
                  Weekly Delivery
                </span>
              </div>

              {/* Headline */}
              <h2
                className="font-fredoka font-bold leading-[1.05] mb-4"
                style={{ fontSize: 'clamp(1.85rem, 4vw, 2.85rem)' }}
              >
                <span className="text-white">Get Free Coloring Pages</span>
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(110deg, #ea1974 0%, #bc25c4 48%, #58b7da 100%)' }}
                >
                  Every Week
                </span>
              </h2>

              <p
                className="font-dm-sans text-white/42 leading-relaxed mb-9"
                style={{ fontSize: '0.9375rem', maxWidth: '38ch' }}
              >
                Fresh free printable coloring pages for kids and adults, delivered to your inbox — free, forever.
              </p>

              {/* Success state */}
              {status === 'success' ? (
                <div
                  className="mb-7 inline-flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(88,183,218,0.08)', border: '1px solid rgba(88,183,218,0.25)' }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#58b7da' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <p className="font-dm-sans text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    You&apos;re subscribed!
                  </p>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="mb-7" noValidate>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">

                    {/* Email input */}
                    <div className="relative flex-1">
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2"
                        style={{ color: showValidationError ? 'rgba(234,25,116,0.65)' : 'rgba(255,255,255,0.22)' }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === 'error') { setStatus('idle'); setErrorMessage(''); }
                        }}
                        onBlur={() => setTouched(true)}
                        disabled={status === 'loading'}
                        className="w-full bg-transparent pl-7 pr-2 py-3 font-dm-sans text-white text-sm focus:outline-none transition-all duration-300 disabled:opacity-50"
                        style={{
                          borderBottom: `1.5px solid ${showValidationError ? 'rgba(234,25,116,0.65)' : 'rgba(255,255,255,0.14)'}`,
                          color: 'rgba(255,255,255,0.9)',
                        }}
                        onFocus={(e) => {
                          if (!showValidationError) e.currentTarget.style.borderBottomColor = 'rgba(234,25,116,0.65)';
                        }}
                        onBlurCapture={(e) => {
                          if (!showValidationError) e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.14)';
                        }}
                      />
                      {showValidationError && (
                        <p className="absolute -bottom-5 left-0 font-dm-sans" style={{ fontSize: '11px', color: 'rgba(234,25,116,0.85)' }}>
                          Please enter a valid email address
                        </p>
                      )}
                      {status === 'error' && (
                        <p className="absolute -bottom-5 left-0 font-dm-sans" style={{ fontSize: '11px', color: 'rgba(234,25,116,0.85)' }}>
                          {errorMessage}
                        </p>
                      )}
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="group/btn relative inline-block flex-shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <div
                        className="absolute -inset-0.5 translate-x-[6px] translate-y-[6px] rounded-xl opacity-55 transition-all duration-500 group-hover/btn:translate-x-[9px] group-hover/btn:translate-y-[9px]"
                        style={{ background: '#58b7da', clipPath: 'polygon(1% 8%, 100% 2%, 98% 94%, 1% 98%)' }}
                      />
                      <div
                        className="absolute -inset-0.5 translate-x-[3px] translate-y-[3px] rounded-xl opacity-70 transition-all duration-300 group-hover/btn:translate-x-[5px] group-hover/btn:translate-y-[5px]"
                        style={{ background: '#ea1974', clipPath: 'polygon(0% 6%, 98% 4%, 99% 94%, 1% 97%)' }}
                      />
                      <div
                        className="relative px-6 py-[11px] rounded-xl overflow-hidden transition-all duration-300 group-hover/btn:scale-[1.02] group-hover/btn:-rotate-[0.5deg]"
                        style={{
                          background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)',
                          clipPath: 'polygon(1% 5%, 99% 0%, 98% 95%, 0% 92%)',
                        }}
                      >
                        <span className="relative flex items-center gap-2 font-fredoka font-bold text-white text-sm tracking-wide whitespace-nowrap">
                          {status === 'loading' ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Subscribing...
                            </>
                          ) : (
                            <>
                              Subscribe Free
                              <svg
                                className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                              >
                                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                              </svg>
                            </>
                          )}
                        </span>
                      </div>
                    </button>
                  </div>
                </form>
              )}

              {/* Perks */}
              <div className="flex flex-wrap gap-x-5 gap-y-2" style={{ marginTop: showValidationError || status === 'error' ? '1.75rem' : undefined }}>
                {PERKS.map((perk) => (
                  <span
                    key={perk}
                    className="inline-flex items-center gap-1.5 font-dm-sans"
                    style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}
                  >
                    <svg
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: 'rgba(88,183,218,0.55)' }}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {perk}
                  </span>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
