'use client';

import { useState } from 'react';
import { PRIVACY_POLICY_PAGE, TERMS_OF_USE_PAGE } from '@/lib/static-pages-content';

type Tab = 'privacy' | 'terms';

type Section = {
  id: string;
  heading: string;
  body?: string;
  subsections?: { id: string; heading: string; body: string }[];
};

function SectionBody({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {text.split('\n\n').map((block, i) => {
        if (block.includes('\n—') || block.startsWith('—')) {
          const lines = block.split('\n');
          const intro = lines[0].startsWith('—') ? null : lines[0];
          const bullets = lines.filter((l) => l.startsWith('—'));
          return (
            <div key={i}>
              {intro && (
                <p className="font-dm-sans text-white/55 text-sm leading-relaxed mb-3">{intro}</p>
              )}
              <ul className="space-y-2">
                {bullets.map((bullet, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full"
                      style={{ background: '#ea1974' }} />
                    <span className="font-dm-sans text-white/55 text-sm leading-relaxed">
                      {bullet.replace(/^—\s*/, '')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        if (block.match(/^[A-Z][^:]+:/m)) {
          return (
            <div key={i} className="space-y-2">
              {block.split('\n').map((line, j) => {
                const colonIdx = line.indexOf(':');
                if (colonIdx > 0 && line[0] === line[0].toUpperCase() && !line.startsWith('—')) {
                  const label = line.slice(0, colonIdx + 1);
                  const rest = line.slice(colonIdx + 1).trim();
                  return (
                    <p key={j} className="font-dm-sans text-white/55 text-sm leading-relaxed">
                      <span className="font-semibold text-white/80">{label}</span>
                      {rest ? ` ${rest}` : ''}
                    </p>
                  );
                }
                return (
                  <p key={j} className="font-dm-sans text-white/55 text-sm leading-relaxed">{line}</p>
                );
              })}
            </div>
          );
        }
        return (
          <p key={i} className="font-dm-sans text-white/55 text-sm leading-relaxed">{block}</p>
        );
      })}
    </div>
  );
}

function SectionList({ sections, accentColor }: { sections: readonly Section[]; accentColor: string }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.id} id={section.id}
          className="scroll-mt-28 rounded-2xl border border-white/[0.07] overflow-hidden"
          style={{ background: '#111118' }}>
          <div className="px-7 py-5 border-b border-white/[0.07]"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h2 className="font-fredoka font-bold text-white"
              style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)' }}>
              {section.heading}
            </h2>
          </div>

          <div className="px-7 py-6 space-y-6">
            {'body' in section && section.body && (
              <SectionBody text={section.body} />
            )}
            {'subsections' in section && section.subsections && section.subsections.map((sub) => (
              <div key={sub.id} id={sub.id} className="scroll-mt-28">
                <h3 className="font-fredoka font-bold text-white/85 text-base mb-3 flex items-center gap-2">
                  <span className="w-0.5 h-4 rounded-full flex-shrink-0"
                    style={{ background: accentColor }} />
                  {sub.heading}
                </h3>
                <SectionBody text={sub.body} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'privacy',
    label: 'Privacy Policy',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'terms',
    label: 'Terms of Use',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

const PAGE_DATA = {
  privacy: {
    data: PRIVACY_POLICY_PAGE,
    sections: PRIVACY_POLICY_PAGE.sections as readonly Section[],
    accentColor: '#ea1974',
    tocBorderHover: 'hover:border-pink-500/50',
  },
  terms: {
    data: TERMS_OF_USE_PAGE,
    sections: TERMS_OF_USE_PAGE.sections as readonly Section[],
    accentColor: '#bc25c4',
    tocBorderHover: 'hover:border-purple-500/50',
  },
};

export default function LegalTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('privacy');
  const active = PAGE_DATA[activeTab];

  return (
    <>
      {/* ── TAB BAR ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 py-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex p-1 rounded-xl border border-white/[0.08]"
            style={{ background: '#111118' }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-dm-sans font-medium transition-all duration-200"
                  style={{
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                    background: isActive
                      ? 'linear-gradient(110deg, #ea197420, #bc25c420, #58b7da20)'
                      : 'transparent',
                  }}>
                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                      style={{ background: PAGE_DATA[tab.id].accentColor }} />
                  )}
                  <span style={{ color: isActive ? PAGE_DATA[tab.id].accentColor : 'rgba(255,255,255,0.35)' }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Bottom rule */}
        <div className="absolute bottom-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 50%, transparent)' }} />
      </div>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <div className="relative py-12 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 lg:gap-16 items-start">

            {/* Sticky TOC — desktop only */}
            <nav className="hidden lg:block sticky top-[72px]" aria-label="Table of Contents">
              <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-4">
                Contents
              </p>
              <ol className="space-y-0.5">
                {active.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}
                      className={`block font-dm-sans text-sm text-white/35 hover:text-white/80 transition-colors duration-200 py-1.5 pl-3 border-l border-white/[0.07] ${active.tocBorderHover} leading-snug`}>
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Main content */}
            <div key={activeTab}>
              {/* Intro block */}
              <div className="mb-8 p-6 rounded-xl border border-white/[0.07]"
                style={{ background: '#111118' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span style={{ color: active.accentColor }}>{TABS.find((t) => t.id === activeTab)?.icon}</span>
                  <span className="font-dm-sans text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                    {activeTab === 'privacy' ? 'Effective' : 'Effective'}: {active.data.header.effectiveDate}
                    &ensp;·&ensp;Last Updated: {active.data.header.lastUpdated}
                  </span>
                </div>
                <SectionBody text={active.data.header.intro} />
              </div>

              {/* Sections */}
              <SectionList sections={active.sections} accentColor={active.accentColor} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
