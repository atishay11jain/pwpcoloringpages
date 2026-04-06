'use client';

import { useState } from 'react';

interface HomeFAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

function FAQItem({ faq, index }: { faq: HomeFAQ; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
        aria-expanded={open}
      >
        <span className="text-white font-semibold font-dm-sans text-base sm:text-lg leading-snug pr-2">
          {faq.question}
        </span>
        <span
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
            open
              ? 'border-pink-500/60 bg-pink-500/10 rotate-45'
              : 'border-white/20 bg-white/5 rotate-0'
          }`}
        >
          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-6 py-5 text-white/65 font-dm-sans text-sm sm:text-base leading-relaxed border-t border-white/10">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export default function HomeFAQAccordion({ faqs }: { faqs: HomeFAQ[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <FAQItem key={faq.id} faq={faq} index={i} />
      ))}
    </div>
  );
}
