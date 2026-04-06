'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CONTACT_PAGE } from '@/lib/static-pages-content';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [charCount, setCharCount] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const form = e.currentTarget;
    const data = {
      fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(json.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmittedEmail(data.email);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  }

  const inputBase =
    'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 font-dm-sans text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/60 focus:bg-white/[0.06] transition-all duration-200 text-sm disabled:opacity-50';

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-white/[0.07] p-10 text-center"
        style={{ background: '#111118' }}>
        {/* Top accent */}
        <div className="h-[3px] w-full rounded-t-2xl -mt-10 mb-10"
          style={{ background: 'linear-gradient(to right, #ea1974, #bc25c4, #58b7da)' }} />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
          style={{ background: 'rgba(234,25,116,0.1)' }}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#ea1974" strokeWidth="2" strokeLinecap="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h3 className="font-fredoka font-bold text-white text-2xl mb-3">
          {CONTACT_PAGE.form.successMessage.title}
        </h3>
        <p className="font-dm-sans text-white/55 text-sm mb-8 leading-relaxed">
          {CONTACT_PAGE.form.successMessage.body.replace('[email]', submittedEmail)}
        </p>

        <Link href={CONTACT_PAGE.form.successMessage.actionHref}
          className="inline-flex items-center gap-2 font-fredoka font-bold text-white text-sm px-6 py-3 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/[0.06] transition-all duration-200">
          ← {CONTACT_PAGE.form.successMessage.actionLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.07]"
      style={{ background: '#111118' }}>
      {/* Top accent bar */}
      <div className="h-[3px] w-full"
        style={{ background: 'linear-gradient(to right, #ea1974, #bc25c4, #58b7da)' }} />

      <form onSubmit={handleSubmit} className="p-7 sm:p-9 space-y-5">
        <h2 className="font-fredoka font-bold text-white text-xl mb-6">{CONTACT_PAGE.form.heading}</h2>

        {/* Name + Email row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-dm-sans text-xs font-medium text-white/40 uppercase tracking-[0.15em] mb-2">
              Full Name <span style={{ color: '#ea1974' }}>*</span>
            </label>
            <input
              name="fullName"
              type="text"
              placeholder="Your name"
              required
              minLength={2}
              disabled={status === 'loading'}
              className={inputBase}
            />
          </div>
          <div>
            <label className="block font-dm-sans text-xs font-medium text-white/40 uppercase tracking-[0.15em] mb-2">
              Email Address <span style={{ color: '#ea1974' }}>*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              disabled={status === 'loading'}
              className={inputBase}
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block font-dm-sans text-xs font-medium text-white/40 uppercase tracking-[0.15em] mb-2">
            Subject <span style={{ color: '#ea1974' }}>*</span>
          </label>
          <div className="relative">
            <select
              name="subject"
              required
              disabled={status === 'loading'}
              defaultValue=""
              className={`${inputBase} appearance-none pr-10`}
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <option value="" disabled className="bg-[#1a1a24] text-white/40">
                What&apos;s this about?
              </option>
              {(CONTACT_PAGE.form.fields.find((f) => f.id === 'subject') as { options?: { value: string; label: string }[] } | undefined)
                ?.options?.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#1a1a24] text-white">
                    {opt.label}
                  </option>
                ))}
            </select>
            {/* Chevron */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block font-dm-sans text-xs font-medium text-white/40 uppercase tracking-[0.15em]">
              Message <span style={{ color: '#ea1974' }}>*</span>
            </label>
            <span className={`font-dm-sans text-xs transition-colors ${charCount > 900 ? 'text-amber-400/70' : 'text-white/25'}`}>
              {charCount}/1000
            </span>
          </div>
          <textarea
            name="message"
            placeholder="Tell us more..."
            required
            rows={5}
            minLength={20}
            maxLength={1000}
            disabled={status === 'loading'}
            onChange={(e) => setCharCount(e.target.value.length)}
            className={`${inputBase} resize-none`}
          />
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-red-500/20 bg-red-500/[0.06]">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
            </svg>
            <p className="font-dm-sans text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="group relative w-full inline-block disabled:opacity-70 disabled:cursor-not-allowed mt-2">
          <div className="absolute -inset-0.5 translate-x-[5px] translate-y-[5px] rounded-xl opacity-50 transition-all duration-500 group-hover:translate-x-[8px] group-hover:translate-y-[8px] group-disabled:translate-x-0 group-disabled:translate-y-0"
            style={{ background: '#58b7da', clipPath: 'polygon(1% 8%, 100% 2%, 98% 94%, 1% 98%)' }} />
          <div className="absolute -inset-0.5 translate-x-[2.5px] translate-y-[2.5px] rounded-xl opacity-65 transition-all duration-300 group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-disabled:translate-x-0 group-disabled:translate-y-0"
            style={{ background: '#ea1974', clipPath: 'polygon(0% 6%, 98% 4%, 99% 94%, 1% 97%)' }} />
          <div className="relative w-full px-6 py-3.5 rounded-xl transition-all duration-300 group-hover:scale-[1.01] group-disabled:scale-100"
            style={{ background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)', clipPath: 'polygon(1% 5%, 99% 0%, 98% 95%, 0% 92%)' }}>
            <span className="flex items-center justify-center gap-2 font-fredoka font-bold text-white text-base tracking-wide">
              {status === 'loading' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  {CONTACT_PAGE.form.submitLabel}
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </span>
          </div>
        </button>
      </form>
    </div>
  );
}
