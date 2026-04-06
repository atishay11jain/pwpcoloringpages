import type { Metadata } from 'next';
import LegalTabs from './LegalTabs';

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms of Use | Paint With Purpose',
  description:
    'Read the Paint With Purpose Privacy Policy and Terms of Use. Understand how we collect your data and the rules for using our free coloring pages.',
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-14 sm:pt-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full blur-[120px] opacity-10"
            style={{ background: 'radial-gradient(circle, #ea1974, transparent 70%)' }} />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-[100px] opacity-8"
            style={{ background: 'radial-gradient(circle, #bc25c4, transparent 70%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] mb-8">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#ea1974"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-dm-sans font-medium uppercase tracking-[0.22em] text-[11px] text-white/50">
              Legal
            </span>
          </div>

          <h1 className="font-fredoka font-bold text-white leading-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
            Privacy &amp; Terms
          </h1>

          <p className="font-dm-sans text-white/50 leading-relaxed max-w-xl mx-auto"
            style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)' }}>
            Everything you need to know about how we handle your data and what you agree to when using Paint With Purpose.
          </p>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #ea1974 30%, #bc25c4 50%, #58b7da 70%, transparent)' }} />
      </section>

      {/* ── TABBED LEGAL CONTENT ─────────────────────────────── */}
      <LegalTabs />

    </main>
  );
}
