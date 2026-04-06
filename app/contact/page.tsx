import type { Metadata } from 'next';
import { CONTACT_PAGE, BRAND } from '@/lib/static-pages-content';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: CONTACT_PAGE.meta.title,
  description: CONTACT_PAGE.meta.description,
  alternates: {
    canonical: 'https://pwpcoloringpages.com/contact',
  },
  openGraph: {
    title: CONTACT_PAGE.meta.title,
    description: CONTACT_PAGE.meta.description,
    url: 'https://pwpcoloringpages.com/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: CONTACT_PAGE.meta.title,
    description: CONTACT_PAGE.meta.description,
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 sm:pt-20 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full blur-[120px] opacity-12"
            style={{ background: 'radial-gradient(circle, #ea1974, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-[100px] opacity-8"
            style={{ background: 'radial-gradient(circle, #bc25c4, transparent 70%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] mb-8">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#ea1974" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="font-dm-sans font-medium uppercase tracking-[0.22em] text-[11px] text-white/50">
              {CONTACT_PAGE.hero.eyebrow}
            </span>
          </div>

          <h1 className="font-fredoka font-bold text-white leading-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
            {CONTACT_PAGE.hero.headline}
          </h1>

          <p className="font-dm-sans text-white/50 leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
            {CONTACT_PAGE.hero.subheadline}
          </p>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #ea1974 30%, #bc25c4 50%, #58b7da 70%, transparent)' }} />
      </section>

      {/* ── FORM + SIDEBAR ───────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-1/4 left-0 w-60 h-60 rounded-full blur-[100px] opacity-8"
            style={{ background: 'radial-gradient(circle, #58b7da, transparent)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">

            {/* Left: Form */}
            <ContactForm />

            {/* Right: Details + FAQ */}
            <div className="space-y-8">

              {/* Contact Details */}
              <div className="rounded-2xl border border-white/[0.07] p-7"
                style={{ background: '#111118' }}>
                <h3 className="font-fredoka font-bold text-white text-lg mb-6">
                  {CONTACT_PAGE.contactDetails.heading}
                </h3>

                <div className="flex items-start gap-3.5 mb-5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(234,25,116,0.1)' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#ea1974" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-dm-sans text-xs text-white/35 uppercase tracking-[0.15em] mb-1">Email</p>
                    <a href={`mailto:${BRAND.email}`}
                      className="font-dm-sans text-white/80 text-sm hover:text-white transition-colors duration-200">
                      {BRAND.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(88,183,218,0.1)' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#58b7da" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-dm-sans text-xs text-white/35 uppercase tracking-[0.15em] mb-1">Response Time</p>
                    <p className="font-dm-sans text-white/80 text-sm">{CONTACT_PAGE.contactDetails.responseTime}</p>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-white/[0.07]">
                  <p className="font-dm-sans text-white/35 text-xs leading-relaxed">
                    {CONTACT_PAGE.contactDetails.note}
                  </p>
                </div>
              </div>

              {/* FAQ */}
              <div className="rounded-2xl border border-white/[0.07] p-7"
                style={{ background: '#111118' }}>
                <h3 className="font-fredoka font-bold text-white text-lg mb-6">
                  {CONTACT_PAGE.faqs.heading}
                </h3>

                <div className="space-y-5">
                  {CONTACT_PAGE.faqs.items.map((faq, i) => (
                    <div key={i} className={i > 0 ? 'pt-5 border-t border-white/[0.06]' : ''}>
                      <p className="font-dm-sans font-semibold text-white/85 text-sm leading-snug mb-2">
                        {faq.question}
                      </p>
                      <p className="font-dm-sans text-white/40 text-xs leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
