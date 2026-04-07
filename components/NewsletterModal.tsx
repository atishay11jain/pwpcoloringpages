'use client';

import { useState, useEffect } from 'react';
import { event as gaEvent } from '@/lib/gtag';

interface NewsletterModalProps {
  isOpen: boolean;
  initialEmail?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterModal({ isOpen, initialEmail = '', onClose, onSuccess }: NewsletterModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      gaEvent('newsletter_subscribe', { source: 'modal' });
      onSuccess?.();
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[#1a1a24] rounded-3xl shadow-2xl max-w-md w-full p-10 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="relative text-center py-4">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-3 font-fredoka">You&apos;re in!</h2>
            <p className="text-white/70 font-dm-sans mb-8">
              Welcome to the Paint With Purpose community. Check your inbox for your first free coloring page!
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-semibold text-white font-dm-sans"
              style={{ background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)' }}
            >
              Awesome, thanks!
            </button>
          </div>
        ) : (
          <>
            <div className="relative text-center mb-8">
              <div className="text-7xl mb-6 animate-bounce">🎨✏️</div>
              <h2 className="text-4xl font-bold text-white mb-4 font-fredoka">Stay Creative!</h2>
              <p className="text-white/70 text-lg font-dm-sans">
                Subscribe to get the latest coloring pages and exclusive content delivered to your inbox
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                required
                disabled={status === 'loading'}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-dm-sans disabled:opacity-50"
              />

              {status === 'error' && (
                <p className="text-red-400 text-sm font-dm-sans px-1">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="group relative w-full px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-pink-500/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />
                <span className="relative flex items-center justify-center gap-2 font-dm-sans">
                  {status === 'loading' ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe Now
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
