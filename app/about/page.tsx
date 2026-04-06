import type { Metadata } from 'next';
import Link from 'next/link';
import { ABOUT_PAGE } from '@/lib/static-pages-content';

export const metadata: Metadata = {
  title: ABOUT_PAGE.meta.title,
  description: ABOUT_PAGE.meta.description,
  alternates: {
    canonical: 'https://pwpcoloringpages.com/about',
  },
  openGraph: {
    title: ABOUT_PAGE.meta.title,
    description: ABOUT_PAGE.meta.description,
    url: 'https://pwpcoloringpages.com/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: ABOUT_PAGE.meta.title,
    description: ABOUT_PAGE.meta.description,
  },
};

const OFFERING_ICONS: Record<string, React.ReactNode> = {
  palette: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  users: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  book: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  ),
};

const VALUE_COLORS = ['#ea1974', '#bc25c4', '#58b7da', '#ea1974'];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-10 sm:pt-12 sm:pb-14 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-[120px] opacity-15"
            style={{ background: 'radial-gradient(circle, #ea1974, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[100px] opacity-10"
            style={{ background: 'radial-gradient(circle, #bc25c4, transparent 70%)' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-[90px] opacity-8"
            style={{ background: 'radial-gradient(circle, #58b7da, transparent 70%)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] mb-10">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ea1974' }} />
            <span className="font-dm-sans font-medium uppercase tracking-[0.22em] text-[11px] text-white/50">
              {ABOUT_PAGE.hero.eyebrow}
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-fredoka font-bold leading-[1.05] mb-4" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.75rem)' }}>
            <span className="text-white">{ABOUT_PAGE.hero.headline.line1}</span>
            <br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(110deg, #ea1974 0%, #bc25c4 50%, #58b7da 100%)' }}>
              {ABOUT_PAGE.hero.headline.line2}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="font-dm-sans text-white/55 leading-relaxed max-w-2xl mx-auto"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
            {ABOUT_PAGE.hero.subheadline}
          </p>
        </div>

        {/* Bottom gradient rule */}
        <div className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #ea1974 30%, #bc25c4 50%, #58b7da 70%, transparent)' }} />
      </section>

      {/* ── MISSION ──────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-0 top-1/2 w-56 h-56 rounded-full blur-[100px] opacity-8"
            style={{ background: 'radial-gradient(circle, #ea1974, transparent)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-fredoka font-bold text-white mb-2" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
              {ABOUT_PAGE.mission.heading}
            </h2>
            <div className="h-0.5 w-16 mx-auto rounded-full mt-4"
              style={{ background: 'linear-gradient(to right, #ea1974, #bc25c4)' }} />
          </div>

          <div className="space-y-5">
            {ABOUT_PAGE.mission.body.map((para, i) => (
              <p key={i}
                className={`font-dm-sans leading-relaxed text-center ${para === 'We built Paint With Purpose to fix that.' ? 'text-white font-semibold text-lg' : 'text-white/60'}`}
                style={{ fontSize: para === 'We built Paint With Purpose to fix that.' ? '1.15rem' : '1rem' }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFERINGS ─────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />
          <div className="absolute bottom-0 inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />
          <div className="absolute inset-0" style={{ background: '#111118' }} />
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full blur-[110px] opacity-10"
            style={{ background: 'radial-gradient(circle, #bc25c4, transparent)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-fredoka font-bold text-white" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
              {ABOUT_PAGE.offerings.heading}
            </h2>
            <div className="h-0.5 w-16 mx-auto rounded-full mt-4"
              style={{ background: 'linear-gradient(to right, #ea1974, #bc25c4)' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ABOUT_PAGE.offerings.cards.map((card, i) => (
              <div key={i}
                className="group relative rounded-2xl p-8 border border-white/[0.07] hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#0a0a0f' }}>
                {/* Top accent line */}
                <div className="absolute top-0 inset-x-6 h-px rounded-full transition-all duration-300 group-hover:inset-x-0"
                  style={{ background: 'linear-gradient(to right, #ea1974, #bc25c4, #58b7da)' }} />

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6"
                  style={{ background: 'rgba(234,25,116,0.08)', color: '#ea1974' }}>
                  {OFFERING_ICONS[card.iconHint]}
                </div>

                <h3 className="font-fredoka font-bold text-white text-xl mb-3">{card.title}</h3>
                <p className="font-dm-sans text-white/50 leading-relaxed text-sm">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full blur-[110px] opacity-10"
            style={{ background: 'radial-gradient(circle, #58b7da, transparent)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-fredoka font-bold text-white" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
              {ABOUT_PAGE.values.heading}
            </h2>
            <div className="h-0.5 w-16 mx-auto rounded-full mt-4"
              style={{ background: 'linear-gradient(to right, #ea1974, #bc25c4)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ABOUT_PAGE.values.items.map((item, i) => (
              <div key={i}
                className="relative rounded-2xl p-7 border border-white/[0.07]"
                style={{ background: '#111118' }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-1 self-stretch rounded-full"
                    style={{ background: VALUE_COLORS[i % VALUE_COLORS.length] }} />
                  <div>
                    <h3 className="font-fredoka font-bold text-white text-lg mb-2">{item.title}</h3>
                    <p className="font-dm-sans text-white/50 leading-relaxed text-sm">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUDIENCE ──────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)' }} />
          <div className="absolute inset-0" style={{ background: '#111118' }} />
          <div className="absolute top-1/4 left-1/2 w-80 h-80 rounded-full blur-[130px] opacity-8"
            style={{ background: 'radial-gradient(circle, #ea1974, transparent)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-fredoka font-bold text-white" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
              {ABOUT_PAGE.audience.heading}
            </h2>
            <div className="h-0.5 w-16 mx-auto rounded-full mt-4"
              style={{ background: 'linear-gradient(to right, #ea1974, #bc25c4)' }} />
            <p className="font-dm-sans text-white/50 mt-6 text-base">{ABOUT_PAGE.audience.intro}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {ABOUT_PAGE.audience.groups.map((group, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none"
                  stroke="#ea1974" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="font-dm-sans text-white/60 text-sm leading-relaxed">{group}</span>
              </div>
            ))}
          </div>

          <p className="text-center font-fredoka font-bold text-white/80 text-xl">
            {ABOUT_PAGE.audience.closing}
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-[#0a0a0f]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[140px] opacity-12"
            style={{ background: 'radial-gradient(ellipse, #bc25c4, transparent 65%)' }} />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-fredoka font-bold text-white mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {ABOUT_PAGE.cta.heading}
          </h2>
          <p className="font-dm-sans text-white/50 mb-10 text-base">{ABOUT_PAGE.cta.body}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary button */}
            <Link href={ABOUT_PAGE.cta.primaryButton.href} className="group relative inline-block">
              <div className="absolute -inset-0.5 translate-x-[6px] translate-y-[6px] rounded-xl opacity-55 transition-all duration-500 group-hover:translate-x-[9px] group-hover:translate-y-[9px]"
                style={{ background: '#58b7da', clipPath: 'polygon(1% 8%, 100% 2%, 98% 94%, 1% 98%)' }} />
              <div className="absolute -inset-0.5 translate-x-[3px] translate-y-[3px] rounded-xl opacity-70 transition-all duration-300 group-hover:translate-x-[5px] group-hover:translate-y-[5px]"
                style={{ background: '#ea1974', clipPath: 'polygon(0% 6%, 98% 4%, 99% 94%, 1% 97%)' }} />
              <div className="relative px-7 py-3.5 rounded-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-rotate-[0.5deg]"
                style={{ background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)', clipPath: 'polygon(1% 5%, 99% 0%, 98% 95%, 0% 92%)' }}>
                <span className="relative font-fredoka font-bold text-white text-base tracking-wide flex items-center gap-2">
                  {ABOUT_PAGE.cta.primaryButton.label}
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Secondary button */}
            <Link href={ABOUT_PAGE.cta.secondaryButton.href}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/25 transition-all duration-300 font-fredoka font-bold text-white text-base">
              {ABOUT_PAGE.cta.secondaryButton.label}
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
