declare global {
  // eslint-disable-next-line no-var
  var gtag: (...args: unknown[]) => void;
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

export function event(action: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !GA_ID) return;
  window.gtag('event', action, params);
}
